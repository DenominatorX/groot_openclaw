import type {
  AgentId,
  CompanyId,
  RunId,
  Nullable,
  Timestamp,
  AgentRole,
  AgentStatus,
} from "../types/index.js";

export interface Agent {
  id: AgentId;
  companyId: CompanyId;
  name: string;
  role: AgentRole;
  title: Nullable<string>;
  capabilities: Nullable<string>;
  status: AgentStatus;
  reportsTo: Nullable<AgentId>;

  // Execution
  adapterType: string;
  adapterConfig: Record<string, unknown>;
  runtimeConfig: AgentRuntimeConfig;

  // Budget (cents per month, 0 = unlimited)
  budgetMonthlyCents: number;
  spentMonthlyCents: number;

  // Metadata
  urlKey: string;
  lastHeartbeatAt: Nullable<Timestamp>;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Derived (populated on fetch)
  chainOfCommand?: ChainOfCommandEntry[];
}

export interface ChainOfCommandEntry {
  id: AgentId;
  name: string;
  role: AgentRole;
  title: Nullable<string>;
}

export interface AgentRuntimeConfig {
  heartbeat: HeartbeatConfig;
}

export interface HeartbeatConfig {
  enabled: boolean;
  intervalSec: number;
  cooldownSec: number;
  wakeOnDemand: boolean;
  maxConcurrentRuns: number;
}

export interface AgentRun {
  id: RunId;
  agentId: AgentId;
  status: import("../types/index.js").RunStatus;
  invocationSource: import("../types/index.js").RunInvocationSource;
  triggerDetail: Nullable<string>;
  startedAt: Nullable<Timestamp>;
  finishedAt: Nullable<Timestamp>;
  createdAt: Timestamp;
}
