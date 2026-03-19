import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  index,
  uniqueIndex,
  serial,
} from "drizzle-orm/pg-core";

// ─── Companies ────────────────────────────────────────────────────────────────

export const companies = pgTable("companies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  urlKey: text("url_key").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Agents ──────────────────────────────────────────────────────────────────

export const agents = pgTable(
  "agents",
  {
    id: text("id").primaryKey(),
    companyId: text("company_id")
      .notNull()
      .references(() => companies.id),
    name: text("name").notNull(),
    role: text("role").notNull(),
    title: text("title"),
    capabilities: text("capabilities"),
    status: text("status").notNull().default("idle"),
    reportsTo: text("reports_to"),
    adapterType: text("adapter_type").notNull(),
    adapterConfig: jsonb("adapter_config").notNull().default({}),
    runtimeConfig: jsonb("runtime_config").notNull().default({}),
    budgetMonthlyCents: integer("budget_monthly_cents").notNull().default(0),
    spentMonthlyCents: integer("spent_monthly_cents").notNull().default(0),
    urlKey: text("url_key").notNull(),
    lastHeartbeatAt: timestamp("last_heartbeat_at"),
    instructionsPath: text("instructions_path"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    companyIdIdx: index("agents_company_id_idx").on(t.companyId),
    urlKeyUniq: uniqueIndex("agents_url_key_company_uniq").on(
      t.companyId,
      t.urlKey,
    ),
  }),
);

// ─── Agent Runs ──────────────────────────────────────────────────────────────

export const agentRuns = pgTable(
  "agent_runs",
  {
    id: text("id").primaryKey(),
    agentId: text("agent_id")
      .notNull()
      .references(() => agents.id),
    companyId: text("company_id")
      .notNull()
      .references(() => companies.id),
    status: text("status").notNull().default("queued"),
    invocationSource: text("invocation_source").notNull(),
    triggerDetail: text("trigger_detail"),
    contextVars: jsonb("context_vars").default({}),
    startedAt: timestamp("started_at"),
    finishedAt: timestamp("finished_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    agentIdIdx: index("agent_runs_agent_id_idx").on(t.agentId),
    statusIdx: index("agent_runs_status_idx").on(t.status),
  }),
);

// ─── Goals ───────────────────────────────────────────────────────────────────

export const goals = pgTable(
  "goals",
  {
    id: text("id").primaryKey(),
    companyId: text("company_id")
      .notNull()
      .references(() => companies.id),
    parentId: text("parent_id"),
    ownerAgentId: text("owner_agent_id"),
    title: text("title").notNull(),
    description: text("description"),
    level: text("level").notNull().default("company"),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    companyIdIdx: index("goals_company_id_idx").on(t.companyId),
  }),
);

// ─── Projects ────────────────────────────────────────────────────────────────

export const projects = pgTable(
  "projects",
  {
    id: text("id").primaryKey(),
    companyId: text("company_id")
      .notNull()
      .references(() => companies.id),
    name: text("name").notNull(),
    description: text("description"),
    status: text("status").notNull().default("in_progress"),
    leadAgentId: text("lead_agent_id"),
    targetDate: timestamp("target_date"),
    color: text("color"),
    urlKey: text("url_key").notNull(),
    executionWorkspacePolicy: jsonb("execution_workspace_policy"),
    archivedAt: timestamp("archived_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    companyIdIdx: index("projects_company_id_idx").on(t.companyId),
    urlKeyUniq: uniqueIndex("projects_url_key_company_uniq").on(
      t.companyId,
      t.urlKey,
    ),
  }),
);

export const projectWorkspaces = pgTable(
  "project_workspaces",
  {
    id: text("id").primaryKey(),
    companyId: text("company_id")
      .notNull()
      .references(() => companies.id),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    cwd: text("cwd"),
    repoUrl: text("repo_url"),
    repoRef: text("repo_ref"),
    isPrimary: boolean("is_primary").notNull().default(false),
    metadata: jsonb("metadata"),
    runtimeServices: jsonb("runtime_services").default([]),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    projectIdIdx: index("project_workspaces_project_id_idx").on(t.projectId),
  }),
);

// ─── Issues ──────────────────────────────────────────────────────────────────

export const issues = pgTable(
  "issues",
  {
    id: text("id").primaryKey(),
    companyId: text("company_id")
      .notNull()
      .references(() => companies.id),
    projectId: text("project_id").references(() => projects.id),
    goalId: text("goal_id").references(() => goals.id),
    parentId: text("parent_id"),

    title: text("title").notNull(),
    description: text("description"),
    status: text("status").notNull().default("todo"),
    priority: text("priority").notNull().default("medium"),

    assigneeAgentId: text("assignee_agent_id"),
    assigneeUserId: text("assignee_user_id"),

    // Checkout lock
    checkoutRunId: text("checkout_run_id"),
    executionRunId: text("execution_run_id"),
    executionAgentNameKey: text("execution_agent_name_key"),
    executionLockedAt: timestamp("execution_locked_at"),

    requestDepth: integer("request_depth").notNull().default(0),
    billingCode: text("billing_code"),
    issueNumber: serial("issue_number"),
    identifier: text("identifier").notNull(),

    assigneeAdapterOverrides: jsonb("assignee_adapter_overrides"),
    executionWorkspaceSettings: jsonb("execution_workspace_settings"),

    createdByAgentId: text("created_by_agent_id"),
    createdByUserId: text("created_by_user_id"),

    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    cancelledAt: timestamp("cancelled_at"),
    hiddenAt: timestamp("hidden_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    companyIdStatusIdx: index("issues_company_id_status_idx").on(
      t.companyId,
      t.status,
    ),
    assigneeAgentIdx: index("issues_assignee_agent_idx").on(t.assigneeAgentId),
    identifierIdx: uniqueIndex("issues_identifier_uniq").on(t.identifier),
    projectIdIdx: index("issues_project_id_idx").on(t.projectId),
  }),
);

// ─── Labels ──────────────────────────────────────────────────────────────────

export const labels = pgTable(
  "labels",
  {
    id: text("id").primaryKey(),
    companyId: text("company_id")
      .notNull()
      .references(() => companies.id),
    name: text("name").notNull(),
    color: text("color").notNull().default("#6366f1"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    companyIdIdx: index("labels_company_id_idx").on(t.companyId),
  }),
);

export const issueLabels = pgTable("issue_labels", {
  issueId: text("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  labelId: text("label_id")
    .notNull()
    .references(() => labels.id, { onDelete: "cascade" }),
});

// ─── Comments ────────────────────────────────────────────────────────────────

export const issueComments = pgTable(
  "issue_comments",
  {
    id: text("id").primaryKey(),
    issueId: text("issue_id")
      .notNull()
      .references(() => issues.id, { onDelete: "cascade" }),
    authorAgentId: text("author_agent_id"),
    authorUserId: text("author_user_id"),
    runId: text("run_id"),
    body: text("body").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    issueIdIdx: index("issue_comments_issue_id_idx").on(t.issueId),
    createdAtIdx: index("issue_comments_created_at_idx").on(t.createdAt),
  }),
);

// ─── Approvals ───────────────────────────────────────────────────────────────

export const approvals = pgTable(
  "approvals",
  {
    id: text("id").primaryKey(),
    companyId: text("company_id")
      .notNull()
      .references(() => companies.id),
    requestingAgentId: text("requesting_agent_id")
      .notNull()
      .references(() => agents.id),
    runId: text("run_id"),
    status: text("status").notNull().default("pending"),
    title: text("title").notNull(),
    description: text("description"),
    resolvedByUserId: text("resolved_by_user_id"),
    resolvedByAgentId: text("resolved_by_agent_id"),
    resolvedAt: timestamp("resolved_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    companyIdIdx: index("approvals_company_id_idx").on(t.companyId),
    statusIdx: index("approvals_status_idx").on(t.status),
  }),
);

export const approvalIssueLinks = pgTable("approval_issue_links", {
  approvalId: text("approval_id")
    .notNull()
    .references(() => approvals.id, { onDelete: "cascade" }),
  issueId: text("issue_id")
    .notNull()
    .references(() => issues.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Audit Log ───────────────────────────────────────────────────────────────

export const auditLog = pgTable(
  "audit_log",
  {
    id: text("id").primaryKey(),
    companyId: text("company_id").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    action: text("action").notNull(),
    agentId: text("agent_id"),
    userId: text("user_id"),
    runId: text("run_id"),
    before: jsonb("before"),
    after: jsonb("after"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    entityIdx: index("audit_log_entity_idx").on(t.entityType, t.entityId),
    companyIdIdx: index("audit_log_company_id_idx").on(t.companyId),
    createdAtIdx: index("audit_log_created_at_idx").on(t.createdAt),
  }),
);
