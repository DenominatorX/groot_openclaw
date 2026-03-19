import { eq, and, gte, count, sql, desc } from "drizzle-orm";
import type { Db } from "../db/client.js";
import { agents, issues, agentRuns, approvals } from "../db/schema.js";

export class DashboardService {
  constructor(private db: Db) {}

  async getMetrics(companyId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // ── Agent counts ──────────────────────────────────────────────────────────
    const agentRows = await this.db
      .select()
      .from(agents)
      .where(eq(agents.companyId, companyId));

    const totalAgents = agentRows.length;
    const activeAgents = agentRows.filter(
      (a) => a.lastHeartbeatAt && a.lastHeartbeatAt > sevenDaysAgo,
    ).length;

    const totalBudgetCents = agentRows.reduce((s, a) => s + a.budgetMonthlyCents, 0);
    const totalSpentCents = agentRows.reduce((s, a) => s + a.spentMonthlyCents, 0);

    const agentBudgets = agentRows.map((a) => ({
      agentId: a.id,
      agentName: a.name,
      budgetCents: a.budgetMonthlyCents,
      spentCents: a.spentMonthlyCents,
      utilizationPct:
        a.budgetMonthlyCents > 0
          ? Math.round((a.spentMonthlyCents / a.budgetMonthlyCents) * 100)
          : 0,
    }));

    // ── Issue throughput ──────────────────────────────────────────────────────
    const [issueCountRow] = await this.db
      .select({ total: count() })
      .from(issues)
      .where(eq(issues.companyId, companyId));

    const statusCounts = await this.db
      .select({ status: issues.status, cnt: count() })
      .from(issues)
      .where(eq(issues.companyId, companyId))
      .groupBy(issues.status);

    const [completedLast30] = await this.db
      .select({ cnt: count() })
      .from(issues)
      .where(
        and(
          eq(issues.companyId, companyId),
          eq(issues.status, "done"),
          gte(issues.completedAt, thirtyDaysAgo),
        ),
      );

    const [completedLast7] = await this.db
      .select({ cnt: count() })
      .from(issues)
      .where(
        and(
          eq(issues.companyId, companyId),
          eq(issues.status, "done"),
          gte(issues.completedAt, sevenDaysAgo),
        ),
      );

    // ── Run stats ─────────────────────────────────────────────────────────────
    const runStatusCounts = await this.db
      .select({ status: agentRuns.status, cnt: count() })
      .from(agentRuns)
      .where(
        and(
          eq(agentRuns.companyId, companyId),
          gte(agentRuns.createdAt, thirtyDaysAgo),
        ),
      )
      .groupBy(agentRuns.status);

    const totalRuns = runStatusCounts.reduce((s, r) => s + Number(r.cnt), 0);
    const successRuns = runStatusCounts.find((r) => r.status === "done")?.cnt ?? 0;
    const successRate =
      totalRuns > 0 ? Math.round((Number(successRuns) / totalRuns) * 100) : 0;

    // ── Top active agents (most runs last 30 days) ────────────────────────────
    const topAgentRuns = await this.db
      .select({ agentId: agentRuns.agentId, runCount: count() })
      .from(agentRuns)
      .where(
        and(
          eq(agentRuns.companyId, companyId),
          gte(agentRuns.createdAt, thirtyDaysAgo),
        ),
      )
      .groupBy(agentRuns.agentId)
      .orderBy(desc(count()))
      .limit(5);

    const topAgents = topAgentRuns.map((r) => {
      const agent = agentRows.find((a) => a.id === r.agentId);
      return {
        agentId: r.agentId,
        agentName: agent?.name ?? "Unknown",
        runCount: Number(r.runCount),
      };
    });

    // ── Pending approvals ─────────────────────────────────────────────────────
    const [pendingApprovalsRow] = await this.db
      .select({ cnt: count() })
      .from(approvals)
      .where(and(eq(approvals.companyId, companyId), eq(approvals.status, "pending")));

    // ── Issue status breakdown ────────────────────────────────────────────────
    const issuesByStatus = Object.fromEntries(
      statusCounts.map((r) => [r.status, Number(r.cnt)]),
    );

    return {
      generatedAt: now.toISOString(),
      agents: {
        total: totalAgents,
        activeLastWeek: activeAgents,
        budget: {
          totalCents: totalBudgetCents,
          spentCents: totalSpentCents,
          utilizationPct:
            totalBudgetCents > 0
              ? Math.round((totalSpentCents / totalBudgetCents) * 100)
              : 0,
        },
        perAgent: agentBudgets,
      },
      issues: {
        total: Number(issueCountRow?.total ?? 0),
        byStatus: issuesByStatus,
        completedLast7Days: Number(completedLast7?.cnt ?? 0),
        completedLast30Days: Number(completedLast30?.cnt ?? 0),
      },
      runs: {
        totalLast30Days: totalRuns,
        byStatus: Object.fromEntries(
          runStatusCounts.map((r) => [r.status, Number(r.cnt)]),
        ),
        successRatePct: successRate,
        topAgents,
      },
      governance: {
        pendingApprovals: Number(pendingApprovalsRow?.cnt ?? 0),
      },
    };
  }
}
