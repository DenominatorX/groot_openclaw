import { eq, and, inArray, sql, desc, ilike, or } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import type { Db } from "../db/client.js";
import {
  issues,
  issueComments,
  issueLabels,
  labels,
  agents,
  agentRuns,
  auditLog,
} from "../db/schema.js";
import {
  NotFoundError,
  ConflictError,
  ValidationError,
  type IssueStatus,
} from "@agentic/core";

export interface ListIssuesOptions {
  companyId: string;
  status?: IssueStatus | IssueStatus[];
  assigneeAgentId?: string;
  projectId?: string;
  goalId?: string;
  parentId?: string;
  q?: string;
  limit?: number;
  offset?: number;
}

export interface CheckoutOptions {
  issueId: string;
  agentId: string;
  runId: string;
  expectedStatuses?: IssueStatus[];
}

export interface UpdateIssueOptions {
  issueId: string;
  companyId: string;
  actorAgentId?: string;
  actorUserId?: string;
  runId?: string;
  fields: {
    title?: string;
    description?: string;
    status?: IssueStatus;
    priority?: string;
    assigneeAgentId?: string | null;
    assigneeUserId?: string | null;
    projectId?: string;
    goalId?: string;
    parentId?: string | null;
    billingCode?: string;
  };
  comment?: string;
}

export interface AddCommentOptions {
  issueId: string;
  authorAgentId?: string;
  authorUserId?: string;
  runId?: string;
  body: string;
}

export class IssueService {
  constructor(private db: Db) {}

  async list(opts: ListIssuesOptions) {
    const conditions = [eq(issues.companyId, opts.companyId)];

    if (opts.status) {
      const statuses = Array.isArray(opts.status) ? opts.status : [opts.status];
      conditions.push(inArray(issues.status, statuses));
    }
    if (opts.assigneeAgentId) {
      conditions.push(eq(issues.assigneeAgentId, opts.assigneeAgentId));
    }
    if (opts.projectId) {
      conditions.push(eq(issues.projectId, opts.projectId));
    }
    if (opts.goalId) {
      conditions.push(eq(issues.goalId, opts.goalId));
    }
    if (opts.parentId) {
      conditions.push(eq(issues.parentId, opts.parentId));
    }
    if (opts.q) {
      conditions.push(
        or(
          ilike(issues.title, `%${opts.q}%`),
          ilike(issues.description, `%${opts.q}%`),
          ilike(issues.identifier, `%${opts.q}%`),
        )!,
      );
    }

    const rows = await this.db
      .select()
      .from(issues)
      .where(and(...conditions))
      .orderBy(
        sql`CASE priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 END`,
        desc(issues.createdAt),
      )
      .limit(opts.limit ?? 100)
      .offset(opts.offset ?? 0);

    return rows;
  }

  async get(issueId: string) {
    const row = await this.db
      .select()
      .from(issues)
      .where(eq(issues.id, issueId))
      .limit(1);

    if (!row[0]) throw new NotFoundError("Issue", issueId);

    // Fetch active run if exists
    let activeRun = null;
    if (row[0].executionRunId) {
      const run = await this.db
        .select()
        .from(agentRuns)
        .where(eq(agentRuns.id, row[0].executionRunId))
        .limit(1);
      activeRun = run[0] ?? null;
    }

    // Fetch labels
    const labelRows = await this.db
      .select({ label: labels })
      .from(issueLabels)
      .innerJoin(labels, eq(issueLabels.labelId, labels.id))
      .where(eq(issueLabels.issueId, issueId));

    return {
      ...row[0],
      labels: labelRows.map((r) => r.label),
      activeRun,
    };
  }

  async create(opts: {
    companyId: string;
    title: string;
    description?: string;
    status?: IssueStatus;
    priority?: string;
    projectId?: string;
    goalId?: string;
    parentId?: string;
    assigneeAgentId?: string;
    assigneeUserId?: string;
    billingCode?: string;
    createdByAgentId?: string;
    createdByUserId?: string;
  }) {
    if (!opts.title?.trim()) {
      throw new ValidationError("title is required");
    }

    const id = randomUUID();

    // Get next issue number for company (simple sequential)
    const countResult = await this.db
      .select({ count: sql<string>`COUNT(*)` })
      .from(issues)
      .where(eq(issues.companyId, opts.companyId));

    const nextNum = parseInt(countResult[0]?.count ?? "0") + 1;

    // Derive prefix from company (for now use first 3 chars of company ID or a stored prefix)
    // In production this would come from a company config table
    const prefix = "PROJ";
    const identifier = `${prefix}-${nextNum}`;

    const [created] = await this.db
      .insert(issues)
      .values({
        id,
        companyId: opts.companyId,
        title: opts.title.trim(),
        description: opts.description,
        status: opts.status ?? "todo",
        priority: opts.priority ?? "medium",
        projectId: opts.projectId,
        goalId: opts.goalId,
        parentId: opts.parentId,
        assigneeAgentId: opts.assigneeAgentId,
        assigneeUserId: opts.assigneeUserId,
        billingCode: opts.billingCode,
        createdByAgentId: opts.createdByAgentId,
        createdByUserId: opts.createdByUserId,
        identifier,
      })
      .returning();

    return created!;
  }

  /**
   * Atomic checkout using PostgreSQL advisory locks + status check.
   * Returns 409 if another agent holds the checkout.
   */
  async checkout(opts: CheckoutOptions) {
    const { issueId, agentId, runId, expectedStatuses } = opts;
    const allowed = expectedStatuses ?? ["todo", "backlog", "blocked"];

    // Use a transaction with row-level locking
    return await this.db.transaction(async (tx) => {
      // Lock the row
      const [row] = await tx.execute(
        sql`SELECT * FROM issues WHERE id = ${issueId} FOR UPDATE`,
      );

      if (!row) throw new NotFoundError("Issue", issueId);

      const issue = row as typeof issues.$inferSelect;

      // Already checked out by this run — idempotent
      if (issue.checkoutRunId === runId) {
        return issue;
      }

      // Checked out by another run — conflict
      if (
        issue.checkoutRunId &&
        issue.checkoutRunId !== runId &&
        issue.status === "in_progress"
      ) {
        throw new ConflictError(
          `Issue ${issueId} is already checked out by run ${issue.checkoutRunId}`,
        );
      }

      // Validate status
      if (!allowed.includes(issue.status as IssueStatus)) {
        throw new ConflictError(
          `Issue ${issueId} has status '${issue.status}', expected one of: ${allowed.join(", ")}`,
        );
      }

      const now = new Date();

      const [updated] = await tx
        .update(issues)
        .set({
          status: "in_progress",
          checkoutRunId: runId,
          executionRunId: runId,
          executionLockedAt: now,
          startedAt: issue.startedAt ?? now,
          updatedAt: now,
        })
        .where(eq(issues.id, issueId))
        .returning();

      return updated!;
    });
  }

  async update(opts: UpdateIssueOptions) {
    const { issueId, fields, comment, actorAgentId, actorUserId, runId } = opts;

    const existing = await this.get(issueId);

    const updateData: Partial<typeof issues.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (fields.title !== undefined) updateData.title = fields.title;
    if (fields.description !== undefined)
      updateData.description = fields.description;
    if (fields.priority !== undefined) updateData.priority = fields.priority;
    if (fields.projectId !== undefined) updateData.projectId = fields.projectId;
    if (fields.goalId !== undefined) updateData.goalId = fields.goalId;
    if (fields.billingCode !== undefined)
      updateData.billingCode = fields.billingCode;

    if (fields.assigneeAgentId !== undefined) {
      updateData.assigneeAgentId = fields.assigneeAgentId;
    }
    if (fields.assigneeUserId !== undefined) {
      updateData.assigneeUserId = fields.assigneeUserId;
    }
    if (fields.parentId !== undefined) {
      updateData.parentId = fields.parentId;
    }

    if (fields.status !== undefined) {
      updateData.status = fields.status;
      if (fields.status === "done" || fields.status === "cancelled") {
        updateData.completedAt = new Date();
        if (fields.status === "cancelled") updateData.cancelledAt = new Date();
        // Release checkout lock
        updateData.checkoutRunId = null;
      }
    }

    const [updated] = await this.db
      .update(issues)
      .set(updateData)
      .where(eq(issues.id, issueId))
      .returning();

    // Audit log entry
    await this.db.insert(auditLog).values({
      id: randomUUID(),
      companyId: existing.companyId,
      entityType: "issue",
      entityId: issueId,
      action: "update",
      agentId: actorAgentId ?? null,
      userId: actorUserId ?? null,
      runId: runId ?? null,
      before: existing as Record<string, unknown>,
      after: updated as Record<string, unknown>,
    });

    // Inline comment
    if (comment?.trim()) {
      await this.addComment({
        issueId,
        authorAgentId: actorAgentId,
        authorUserId: actorUserId,
        runId,
        body: comment,
      });
    }

    return updated!;
  }

  async release(issueId: string, runId: string) {
    const [updated] = await this.db
      .update(issues)
      .set({
        checkoutRunId: null,
        updatedAt: new Date(),
      })
      .where(and(eq(issues.id, issueId), eq(issues.checkoutRunId, runId)))
      .returning();

    if (!updated) throw new NotFoundError("Issue", issueId);
    return updated;
  }

  async addComment(opts: AddCommentOptions) {
    const id = randomUUID();

    const [comment] = await this.db
      .insert(issueComments)
      .values({
        id,
        issueId: opts.issueId,
        authorAgentId: opts.authorAgentId,
        authorUserId: opts.authorUserId,
        runId: opts.runId,
        body: opts.body,
      })
      .returning();

    return comment!;
  }

  async listComments(issueId: string) {
    return this.db
      .select()
      .from(issueComments)
      .where(eq(issueComments.issueId, issueId))
      .orderBy(issueComments.createdAt);
  }
}
