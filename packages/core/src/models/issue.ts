import type {
  IssueId,
  AgentId,
  UserId,
  CompanyId,
  ProjectId,
  GoalId,
  RunId,
  CommentId,
  Nullable,
  Timestamp,
  IssueStatus,
  IssuePriority,
} from "../types/index.js";

export interface Issue {
  id: IssueId;
  companyId: CompanyId;
  projectId: Nullable<ProjectId>;
  goalId: Nullable<GoalId>;
  parentId: Nullable<IssueId>;

  // Content
  title: string;
  description: Nullable<string>;
  status: IssueStatus;
  priority: IssuePriority;

  // Assignment
  assigneeAgentId: Nullable<AgentId>;
  assigneeUserId: Nullable<UserId>;

  // Execution tracking
  checkoutRunId: Nullable<RunId>;
  executionRunId: Nullable<RunId>;
  executionAgentNameKey: Nullable<string>;
  executionLockedAt: Nullable<Timestamp>;

  // Lifecycle
  requestDepth: number;
  billingCode: Nullable<string>;
  issueNumber: number;
  identifier: string; // e.g. "BAC-5"

  // Audit
  createdByAgentId: Nullable<AgentId>;
  createdByUserId: Nullable<UserId>;
  startedAt: Nullable<Timestamp>;
  completedAt: Nullable<Timestamp>;
  cancelledAt: Nullable<Timestamp>;
  hiddenAt: Nullable<Timestamp>;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Relations (populated on fetch)
  labels?: Label[];
  activeRun?: ActiveRun | null;
  project?: import("./project.js").Project | null;
  ancestors?: Issue[];
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface ActiveRun {
  id: RunId;
  status: import("../types/index.js").RunStatus;
  agentId: AgentId;
  invocationSource: import("../types/index.js").RunInvocationSource;
  triggerDetail: Nullable<string>;
  startedAt: Nullable<Timestamp>;
  finishedAt: Nullable<Timestamp>;
  createdAt: Timestamp;
}

export interface IssueComment {
  id: CommentId;
  issueId: IssueId;
  authorAgentId: Nullable<AgentId>;
  authorUserId: Nullable<UserId>;
  body: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export interface CreateIssueInput {
  title: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  projectId?: ProjectId;
  goalId?: GoalId;
  parentId?: IssueId;
  assigneeAgentId?: AgentId;
  assigneeUserId?: UserId;
  billingCode?: string;
}

export interface UpdateIssueInput {
  title?: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  projectId?: ProjectId;
  goalId?: GoalId;
  parentId?: IssueId;
  assigneeAgentId?: AgentId | null;
  assigneeUserId?: UserId | null;
  billingCode?: string;
  comment?: string; // Inline comment on status update
}

export interface CheckoutInput {
  agentId: AgentId;
  expectedStatuses?: IssueStatus[];
}
