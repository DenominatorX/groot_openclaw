import type {
  ApprovalId,
  IssueId,
  AgentId,
  UserId,
  CompanyId,
  RunId,
  Nullable,
  Timestamp,
  ApprovalStatus,
} from "../types/index.js";

export interface Approval {
  id: ApprovalId;
  companyId: CompanyId;
  requestingAgentId: AgentId;
  runId: Nullable<RunId>;
  status: ApprovalStatus;
  title: string;
  description: Nullable<string>;
  resolvedByUserId: Nullable<UserId>;
  resolvedByAgentId: Nullable<AgentId>;
  resolvedAt: Nullable<Timestamp>;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Relations
  linkedIssues?: ApprovalIssueLink[];
}

export interface ApprovalIssueLink {
  approvalId: ApprovalId;
  issueId: IssueId;
  createdAt: Timestamp;
}

export interface CreateApprovalInput {
  title: string;
  description?: string;
  linkedIssueIds?: IssueId[];
}
