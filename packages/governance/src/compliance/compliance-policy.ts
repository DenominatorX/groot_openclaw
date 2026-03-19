/**
 * Compliance policy rules — pure logic, no DB access.
 * Defines which actions require approval or are outright blocked.
 */

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface PolicyRule {
  id: string;
  description: string;
  /** Actions that match this rule */
  matchActions: string[];
  riskLevel: RiskLevel;
  /** If true, the action is blocked entirely. If false, it requires approval. */
  blocked: boolean;
}

/** Platform-wide default compliance rules. */
export const DEFAULT_RULES: PolicyRule[] = [
  {
    id: "no-agent-self-hire",
    description: "Agents cannot hire other agents without board approval",
    matchActions: ["agent.create", "agent.hire"],
    riskLevel: "critical",
    blocked: false, // requires approval
  },
  {
    id: "no-budget-self-increase",
    description: "Agents cannot increase their own budget",
    matchActions: ["agent.budget.increase"],
    riskLevel: "high",
    blocked: true,
  },
  {
    id: "no-cross-company-data",
    description: "Agents cannot access data outside their company",
    matchActions: ["data.cross-company-read", "data.cross-company-write"],
    riskLevel: "critical",
    blocked: true,
  },
  {
    id: "destructive-ops-require-approval",
    description: "Destructive operations require human approval",
    matchActions: ["issue.bulk-delete", "project.delete", "agent.delete"],
    riskLevel: "high",
    blocked: false, // requires approval
  },
];

export interface ComplianceCheckResult {
  allowed: boolean;
  requiresApproval: boolean;
  matchedRule?: PolicyRule;
  reason?: string;
}

/**
 * Evaluate an action against the compliance policy rules.
 * Returns whether the action is allowed and whether it needs approval.
 */
export function evaluateAction(
  action: string,
  rules: PolicyRule[] = DEFAULT_RULES,
): ComplianceCheckResult {
  const matched = rules.find((r) => r.matchActions.includes(action));

  if (!matched) {
    return { allowed: true, requiresApproval: false };
  }

  if (matched.blocked) {
    return {
      allowed: false,
      requiresApproval: false,
      matchedRule: matched,
      reason: matched.description,
    };
  }

  // Not blocked, but requires approval
  return {
    allowed: true,
    requiresApproval: true,
    matchedRule: matched,
    reason: matched.description,
  };
}
