/**
 * Approval escalation and routing policy — pure logic, no DB access.
 */

export interface EscalationTarget {
  agentId: string;
  name: string;
  role: string;
}

/**
 * Given a chain of command, determine who should be notified of a pending approval.
 * Returns the first manager in chain, or null if chain is empty (board-level only).
 */
export function getApprovalNotifyTarget(
  chainOfCommand: EscalationTarget[],
): EscalationTarget | null {
  return chainOfCommand[0] ?? null;
}

/**
 * Determine if a given agent role can resolve approvals.
 * Only board users (userId present) or CEO agents can resolve.
 */
export function canResolveApproval(opts: {
  resolverRole?: string;
  isUser: boolean;
}): boolean {
  if (opts.isUser) return true; // board users can always resolve
  if (opts.resolverRole === "ceo") return true;
  return false;
}

/** Returns how long (in ms) a pending approval should remain before auto-escalating. */
export function approvalSlaMs(riskLevel: "low" | "medium" | "high" | "critical"): number {
  const slaHours: Record<string, number> = {
    low: 48,
    medium: 24,
    high: 8,
    critical: 2,
  };
  return (slaHours[riskLevel] ?? 24) * 60 * 60 * 1000;
}
