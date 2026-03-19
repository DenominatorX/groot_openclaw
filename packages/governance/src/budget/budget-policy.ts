/**
 * Pure budget policy logic — no DB access.
 * Determines thresholds and enforcement actions based on usage percentages.
 */

export type BudgetStatus = "ok" | "restricted" | "exceeded";

/** Returns the usage percentage (0–100+) for the given spend/budget. */
export function computeUsagePercent(
  spentCents: number,
  budgetCents: number,
): number {
  if (budgetCents <= 0) return 0; // zero budget = unlimited
  return Math.round((spentCents / budgetCents) * 100);
}

/**
 * Returns the budget status for an agent.
 * - exceeded (≥100%): agent must be auto-paused; no new runs
 * - restricted (≥80%): agent can only work on critical priority tasks
 * - ok (<80%): normal operation
 */
export function checkBudgetStatus(
  spentCents: number,
  budgetCents: number,
): BudgetStatus {
  if (budgetCents <= 0) return "ok"; // zero budget = unlimited
  const pct = computeUsagePercent(spentCents, budgetCents);
  if (pct >= 100) return "exceeded";
  if (pct >= 80) return "restricted";
  return "ok";
}

/** Returns whether a new heartbeat run is allowed given the budget status. */
export function canRunHeartbeat(status: BudgetStatus): boolean {
  return status !== "exceeded";
}

/** Returns whether an agent can work on a given priority under the budget status. */
export function isTaskAllowed(
  status: BudgetStatus,
  priority: string,
): boolean {
  if (status === "exceeded") return false;
  if (status === "restricted") return priority === "critical";
  return true;
}
