// ─── Branded ID types ─────────────────────────────────────────────────────────

export type AgentId = string & { readonly __brand: "AgentId" };
export type UserId = string & { readonly __brand: "UserId" };
export type CompanyId = string & { readonly __brand: "CompanyId" };
export type ProjectId = string & { readonly __brand: "ProjectId" };
export type IssueId = string & { readonly __brand: "IssueId" };
export type GoalId = string & { readonly __brand: "GoalId" };
export type RunId = string & { readonly __brand: "RunId" };
export type ApprovalId = string & { readonly __brand: "ApprovalId" };
export type CommentId = string & { readonly __brand: "CommentId" };

export const asAgentId = (s: string): AgentId => s as AgentId;
export const asUserId = (s: string): UserId => s as UserId;
export const asCompanyId = (s: string): CompanyId => s as CompanyId;
export const asProjectId = (s: string): ProjectId => s as ProjectId;
export const asIssueId = (s: string): IssueId => s as IssueId;
export const asGoalId = (s: string): GoalId => s as GoalId;
export const asRunId = (s: string): RunId => s as RunId;
export const asApprovalId = (s: string): ApprovalId => s as ApprovalId;
export const asCommentId = (s: string): CommentId => s as CommentId;

// ─── Enumerations ─────────────────────────────────────────────────────────────

export type IssueStatus =
  | "backlog"
  | "todo"
  | "in_progress"
  | "in_review"
  | "done"
  | "blocked"
  | "cancelled";

export type IssuePriority = "critical" | "high" | "medium" | "low";

export type AgentRole = "ceo" | "manager" | "engineer" | "analyst" | "reviewer";

export type AgentStatus = "idle" | "running" | "paused" | "offline";

export type RunStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export type RunInvocationSource = "assignment" | "mention" | "schedule" | "manual";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type GoalLevel = "company" | "team" | "individual";

export type GoalStatus = "draft" | "active" | "paused" | "completed" | "cancelled";

// ─── Utility types ────────────────────────────────────────────────────────────

export type Nullable<T> = T | null;
export type Timestamp = string; // ISO 8601

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
