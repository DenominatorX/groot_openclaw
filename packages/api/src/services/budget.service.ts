import { eq, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import type { Db } from "../db/client.js";
import { agents, auditLog } from "../db/schema.js";
import { NotFoundError, BudgetExceededError } from "@agentic/core";
import {
  checkBudgetStatus,
  computeUsagePercent,
} from "@agentic/governance";

export interface SpendRecordOptions {
  agentId: string;
  companyId: string;
  runId?: string;
  amountCents: number;
}

export interface BudgetStatusResult {
  agentId: string;
  budgetMonthlyCents: number;
  spentMonthlyCents: number;
  usagePercent: number;
  status: "ok" | "restricted" | "exceeded";
}

export class BudgetService {
  constructor(private db: Db) {}

  async getStatus(agentId: string): Promise<BudgetStatusResult> {
    const [agent] = await this.db
      .select({
        id: agents.id,
        budgetMonthlyCents: agents.budgetMonthlyCents,
        spentMonthlyCents: agents.spentMonthlyCents,
      })
      .from(agents)
      .where(eq(agents.id, agentId))
      .limit(1);

    if (!agent) throw new NotFoundError("Agent", agentId);

    const status = checkBudgetStatus(
      agent.spentMonthlyCents,
      agent.budgetMonthlyCents,
    );
    const usagePercent = computeUsagePercent(
      agent.spentMonthlyCents,
      agent.budgetMonthlyCents,
    );

    return {
      agentId,
      budgetMonthlyCents: agent.budgetMonthlyCents,
      spentMonthlyCents: agent.spentMonthlyCents,
      usagePercent,
      status,
    };
  }

  /**
   * Record spend for an agent. Throws BudgetExceededError if the agent is at 100%.
   * Returns the updated budget status.
   */
  async recordSpend(opts: SpendRecordOptions): Promise<BudgetStatusResult> {
    const current = await this.getStatus(opts.agentId);

    if (current.status === "exceeded") {
      throw new BudgetExceededError(opts.agentId);
    }

    const now = new Date();

    await this.db
      .update(agents)
      .set({
        spentMonthlyCents: sql`${agents.spentMonthlyCents} + ${opts.amountCents}`,
        updatedAt: now,
      })
      .where(eq(agents.id, opts.agentId));

    // Audit
    await this.db.insert(auditLog).values({
      id: randomUUID(),
      companyId: opts.companyId,
      entityType: "agent",
      entityId: opts.agentId,
      action: "budget.spend",
      agentId: opts.agentId,
      userId: null,
      runId: opts.runId ?? null,
      before: {
        spentMonthlyCents: current.spentMonthlyCents,
      },
      after: {
        spentMonthlyCents: current.spentMonthlyCents + opts.amountCents,
        amountAdded: opts.amountCents,
      },
      createdAt: now,
    });

    return this.getStatus(opts.agentId);
  }

  /**
   * Auto-pause an agent that has exceeded its budget.
   * Sets status to "paused".
   */
  async enforcePause(agentId: string, companyId: string): Promise<void> {
    const status = await this.getStatus(agentId);
    if (status.status !== "exceeded") return;

    const now = new Date();

    await this.db
      .update(agents)
      .set({ status: "paused", updatedAt: now })
      .where(eq(agents.id, agentId));

    await this.db.insert(auditLog).values({
      id: randomUUID(),
      companyId,
      entityType: "agent",
      entityId: agentId,
      action: "budget.auto_pause",
      agentId: null,
      userId: null,
      runId: null,
      before: { status: "running" },
      after: { status: "paused", reason: "budget_exceeded" },
      createdAt: now,
    });
  }

  /**
   * Reset monthly spend for all agents in a company (called at month rollover).
   */
  async resetMonthlySpend(companyId: string): Promise<void> {
    const now = new Date();

    await this.db
      .update(agents)
      .set({ spentMonthlyCents: 0, updatedAt: now })
      .where(eq(agents.companyId, companyId));

    await this.db.insert(auditLog).values({
      id: randomUUID(),
      companyId,
      entityType: "company",
      entityId: companyId,
      action: "budget.monthly_reset",
      agentId: null,
      userId: null,
      runId: null,
      before: null,
      after: { resetAt: now.toISOString() },
      createdAt: now,
    });
  }
}
