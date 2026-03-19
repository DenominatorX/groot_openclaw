import type {
  ProjectId,
  CompanyId,
  GoalId,
  AgentId,
  Nullable,
  Timestamp,
  GoalLevel,
  GoalStatus,
} from "../types/index.js";

export interface Project {
  id: ProjectId;
  companyId: CompanyId;
  name: string;
  description: Nullable<string>;
  status: "planning" | "in_progress" | "on_hold" | "completed" | "cancelled";
  leadAgentId: Nullable<AgentId>;
  targetDate: Nullable<Timestamp>;
  color: Nullable<string>;
  urlKey: string;
  archivedAt: Nullable<Timestamp>;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Relations
  workspaces?: ProjectWorkspace[];
  primaryWorkspace?: Nullable<ProjectWorkspace>;
  goals?: Goal[];
}

export interface ProjectWorkspace {
  id: string;
  companyId: CompanyId;
  projectId: ProjectId;
  name: string;
  cwd: Nullable<string>;
  repoUrl: Nullable<string>;
  repoRef: Nullable<string>;
  isPrimary: boolean;
  metadata: Nullable<Record<string, unknown>>;
  runtimeServices: RuntimeService[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface RuntimeService {
  name: string;
  command: string;
  port?: number;
}

export interface Goal {
  id: GoalId;
  companyId: CompanyId;
  parentId: Nullable<GoalId>;
  ownerAgentId: Nullable<AgentId>;
  title: string;
  description: Nullable<string>;
  level: GoalLevel;
  status: GoalStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
