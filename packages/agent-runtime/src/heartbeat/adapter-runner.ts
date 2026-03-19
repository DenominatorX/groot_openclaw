import { spawn } from "node:child_process";
import type { Agent } from "@agentic/core";

export interface AdapterConfig {
  cwd?: string;
  model?: string;
  timeoutSec?: number;
  env?: Record<string, string>;
}

/**
 * Spawns an adapter subprocess (e.g. claude CLI, codex CLI) with the
 * standard PAPERCLIP_* env vars injected. The adapter is responsible for
 * reading its assignments and doing work within the heartbeat window.
 */
export class AdapterRunner {
  constructor(
    private readonly apiUrl: string,
    private readonly apiKey: string,
  ) {}

  async execute(agent: Agent, runId: string): Promise<void> {
    const config = agent.adapterConfig as AdapterConfig;
    const timeout = (config.timeoutSec ?? 300) * 1000;

    const env = this.buildEnv(agent, runId, config);
    const command = this.resolveCommand(agent.adapterType, config);

    return new Promise((resolve, reject) => {
      const child = spawn(command.cmd, command.args, {
        cwd: config.cwd ?? process.cwd(),
        env: { ...process.env, ...env },
        stdio: "pipe",
      });

      const timer = timeout > 0
        ? setTimeout(() => {
            child.kill("SIGTERM");
            reject(new Error(`Adapter timed out after ${timeout}ms`));
          }, timeout)
        : null;

      child.stdout?.on("data", (data: Buffer) => {
        process.stdout.write(`[agent:${agent.name}] ${data.toString()}`);
      });

      child.stderr?.on("data", (data: Buffer) => {
        process.stderr.write(`[agent:${agent.name}] ${data.toString()}`);
      });

      child.on("error", (err) => {
        if (timer) clearTimeout(timer);
        reject(err);
      });

      child.on("close", (code) => {
        if (timer) clearTimeout(timer);
        if (code === 0 || code === null) {
          resolve();
        } else {
          reject(new Error(`Adapter exited with code ${code}`));
        }
      });
    });
  }

  private buildEnv(
    agent: Agent,
    runId: string,
    config: AdapterConfig,
  ): Record<string, string> {
    return {
      PAPERCLIP_AGENT_ID: agent.id,
      PAPERCLIP_COMPANY_ID: agent.companyId,
      PAPERCLIP_API_URL: this.apiUrl,
      PAPERCLIP_API_KEY: this.apiKey,
      PAPERCLIP_RUN_ID: runId,
      ...(config.env ?? {}),
    };
  }

  private resolveCommand(
    adapterType: string,
    config: AdapterConfig,
  ): { cmd: string; args: string[] } {
    switch (adapterType) {
      case "claude_local":
        return {
          cmd: "claude",
          args: [
            "--model",
            config.model ?? "claude-sonnet-4-6",
            "--print",
            "Continue your Paperclip work.",
          ],
        };

      case "codex_local":
        return {
          cmd: "codex",
          args: ["--quiet", "Continue your Paperclip work."],
        };

      default:
        throw new Error(`Unknown adapter type: ${adapterType}`);
    }
  }
}
