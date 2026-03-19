import { randomUUID } from "node:crypto";
import type { Agent } from "@agentic/core";
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
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      await this.completeRun(runId, "failed").catch(() => {});

      return {
        agentId: agent.id,
        runId,
        status: "failed",
        durationMs: Date.now() - start,
        error,
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

  private async completeRun(runId: string, status: "completed" | "failed") {
    await fetch(`${this.config.apiUrl}/api/runs/${runId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, finishedAt: new Date().toISOString() }),
    });
  }
}
