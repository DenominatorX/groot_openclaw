import { randomUUID } from "node:crypto";
import type { Agent } from "@agentic/core";
import { AdapterError } from "@agentic/core";
import { canRunHeartbeat, checkBudgetStatus } from "@agentic/governance";
import { AdapterRunner } from "./adapter-runner.js";

export interface SchedulerConfig {
  pollIntervalMs?: number;
  apiUrl: string;
  apiKey: string;
  companyId: string;
}

export interface HeartbeatResult {
  agentId: string;
  runId: string;
  status: "completed" | "failed" | "skipped";
  durationMs: number;
  error?: string;
  errorCode?: string;
  recoveryAction?: string;
}

/**
 * Polls for agents due for a heartbeat and executes them.
 *
 * In production this runs as a long-lived process separate from the API.
 * For testing, a single `tick()` can be called directly.
 */
export class HeartbeatScheduler {
  private running = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly runner: AdapterRunner;

  constructor(private readonly config: SchedulerConfig) {
    this.runner = new AdapterRunner(config.apiUrl, config.apiKey);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.scheduleNext();
    console.log(
      `HeartbeatScheduler started (poll interval: ${this.config.pollIntervalMs ?? 10_000}ms)`,
    );
  }

  stop() {
    this.running = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    console.log("HeartbeatScheduler stopped");
  }

  async tick(): Promise<HeartbeatResult[]> {
    const agents = await this.fetchDueAgents();
    const results: HeartbeatResult[] = [];

    for (const agent of agents) {
      const result = await this.runHeartbeat(agent);
      results.push(result);
    }

    return results;
  }

  private scheduleNext() {
    if (!this.running) return;
    const interval = this.config.pollIntervalMs ?? 10_000;
    this.timer = setTimeout(async () => {
      try {
        await this.tick();
      } catch (err) {
        console.error("Scheduler tick error:", err);
      }
      this.scheduleNext();
    }, interval);
  }

  private async fetchDueAgents(): Promise<Agent[]> {
    const res = await fetch(
      `${this.config.apiUrl}/api/companies/${this.config.companyId}/agents`,
      {
        headers: { Authorization: `Bearer ${this.config.apiKey}` },
      },
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch agents: ${res.status}`);
    }

    const all = (await res.json()) as Agent[];

    // Filter to agents with heartbeat enabled, not currently running, and within budget
    return all.filter((a) => {
      const rt = a.runtimeConfig as { heartbeat?: { enabled?: boolean } };
      if (rt?.heartbeat?.enabled !== true) return false;
      if (a.status === "running" || a.status === "paused") return false;

      // Budget enforcement: skip agents that have exceeded their budget
      const budgetStatus = checkBudgetStatus(
        a.spentMonthlyCents ?? 0,
        a.budgetMonthlyCents ?? 0,
      );
      if (!canRunHeartbeat(budgetStatus)) {
        console.warn(
          `Agent ${a.id} (${a.name}) skipped: budget exceeded (${a.spentMonthlyCents}/${a.budgetMonthlyCents} cents)`,
        );
        return false;
      }

      return true;
    });
  }

  private async runHeartbeat(agent: Agent): Promise<HeartbeatResult> {
    const runId = randomUUID();
    const start = Date.now();

    try {
      // Create run record
      await this.createRun(agent.id, runId);

      // Execute via adapter
      await this.runner.execute(agent, runId);

      // Mark run complete
      await this.completeRun(runId, "completed");

      return {
        agentId: agent.id,
        runId,
        status: "completed",
        durationMs: Date.now() - start,
      };
    } catch (rawErr) {
      const isAdapterError = rawErr instanceof AdapterError;
      const errorMessage = rawErr instanceof Error ? rawErr.message : String(rawErr);
      const errorCode = isAdapterError ? rawErr.errorCode : "unknown";

      // Build structured error details for the run record
      const errorDetails: Record<string, unknown> = {
        error: errorMessage,
        errorCode,
      };

      if (isAdapterError) {
        if (rawErr.exitCode !== null) errorDetails.exitCode = rawErr.exitCode;
        if (rawErr.signal) errorDetails.signal = rawErr.signal;
        if (rawErr.timedOut) errorDetails.timedOut = true;
        if (rawErr.stderr) errorDetails.stderr = rawErr.stderr;
      }

      // Release any issues this run had checked out so they can be retried
      let recoveryAction = "manual_intervention_required";
      try {
        const released = await this.releaseRunIssues(runId);
        if (released > 0) {
          recoveryAction = "issues_released_for_retry";
          console.log(
            `Released ${released} issue(s) from failed run ${runId} — they will be retried on next heartbeat`,
          );
        } else {
          recoveryAction = "no_issues_to_release";
        }
      } catch (releaseErr) {
        console.error(
          `Failed to release issues for run ${runId}:`,
          releaseErr,
        );
      }

      errorDetails.recoveryAction = recoveryAction;
      errorDetails.userMessage = this.buildUserMessage(errorCode, recoveryAction, errorDetails);

      await this.completeRun(runId, "failed", errorDetails).catch(() => {});

      return {
        agentId: agent.id,
        runId,
        status: "failed",
        durationMs: Date.now() - start,
        error: errorMessage,
        errorCode,
        recoveryAction,
      };
    }
  }

  private async createRun(agentId: string, runId: string) {
    const res = await fetch(
      `${this.config.apiUrl}/api/agents/${agentId}/runs`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: runId,
          invocationSource: "schedule",
          triggerDetail: "heartbeat",
        }),
      },
    );

    if (!res.ok) {
      throw new Error(`Failed to create run: ${res.status}`);
    }
  }

  private async completeRun(
    runId: string,
    status: "completed" | "failed",
    errorDetails?: Record<string, unknown>,
  ) {
    const body: Record<string, unknown> = {
      status,
      finishedAt: new Date().toISOString(),
    };

    if (errorDetails) {
      body.error = errorDetails.error;
      body.errorCode = errorDetails.errorCode;
      body.errorContext = errorDetails;
    }

    await fetch(`${this.config.apiUrl}/api/runs/${runId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  }

  /**
   * Build a human-readable message explaining what happened, what was
   * recovered automatically, and whether the user needs to take action.
   */
  private buildUserMessage(
    errorCode: string,
    recoveryAction: string,
    details: Record<string, unknown>,
  ): string {
    const parts: string[] = [];

    // What happened
    switch (errorCode) {
      case "adapter_timeout":
        parts.push(
          `Adapter timed out${details.timedOut ? "" : " unexpectedly"}.`,
        );
        break;
      case "adapter_crash":
        parts.push(
          `Adapter process crashed${details.exitCode != null ? ` (exit code ${details.exitCode})` : ""}.`,
        );
        break;
      case "spawn_error":
        parts.push("Failed to start the adapter process.");
        break;
      case "process_lost":
        parts.push("Server restarted while this run was in progress.");
        break;
      default:
        parts.push(`Run failed: ${details.error ?? "unknown error"}.`);
    }

    // What was recovered
    switch (recoveryAction) {
      case "issues_released_for_retry":
        parts.push(
          "Affected issues were automatically released and will be retried on the next heartbeat — no action needed.",
        );
        break;
      case "no_issues_to_release":
        parts.push("No issues were locked by this run — no action needed.");
        break;
      case "manual_intervention_required":
        parts.push(
          "Automatic recovery failed — issues may still be locked. Check the issue board and release them manually if needed.",
        );
        break;
    }

    // Hint for stderr
    if (details.stderr) {
      parts.push("See error context for stderr output.");
    }

    return parts.join(" ");
  }

  /**
   * Release any issues checked out by a failed run so they return to
   * "todo" and can be picked up by the next heartbeat cycle.
   * Returns the number of issues released.
   */
  private async releaseRunIssues(runId: string): Promise<number> {
    const res = await fetch(
      `${this.config.apiUrl}/api/issues/release-by-run/${runId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!res.ok) {
      // 404 means no issues were checked out — that's fine
      if (res.status === 404) return 0;
      throw new Error(`Failed to release issues for run ${runId}: ${res.status}`);
    }

    const data = (await res.json()) as { released: number };
    return data.released;
  }
}
