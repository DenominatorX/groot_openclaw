import { eq, and, inArray } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import type { Db } from "../db/client.js";
import { approvals, approvalIssueLinks, issues, auditLog } from "../db/schema.js";
import { NotFoundError, ForbiddenError, ValidationError } from "@agentic/core";

export interface CreateApprovalOptions {
  companyId: string;
  requestingAgentId: string;
  runId?: string | undefined;
  title: string;
  description?: string | undefined;
  linkedIssueIds?: string[] | undefined;
}

export interface ResolveApprovalOptions {
  approvalId: string;
  companyId: string;
  status: "approved" | "rejected";
  resolvedByAgentId?: string | undefined;
  resolvedByUserId?: string | undefined;
}

export interface ListApprovalsOptions {
  companyId: string;
  status?: "pending" | "approved" | "rejected" | undefined;
  requestingAgentId?: string | undefined;
}

export class ApprovalService {
  constructor(private db: Db) {}

  async create(opts: CreateApprovalOptions) {
    if (!opts.title?.trim()) {
      throw new ValidationError("title is required");
    }

    const id = randomUUID();
    const now = new Date();

    const [approval] = await this.db
      .insert(approvals)
      .values({
        id,
        companyId: opts.companyId,
        requestingAgentId: opts.requestingAgentId,
        runId: opts.runId ?? null,
        status: "pending",
        title: opts.title.trim(),
        description: opts.description ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // Link issues
    if (opts.linkedIssueIds && opts.linkedIssueIds.length > 0) {
      await this.db.insert(approvalIssueLinks).values(
        opts.linkedIssueIds.map((issueId) => ({
          approvalId: id,
          issueId,
          createdAt: now,
        })),
      );
    }

    // Audit
    await this.db.insert(auditLog).values({
      id: randomUUID(),
      companyId: opts.companyId,
      entityType: "approval",
      entityId: id,
      action: "create",
      agentId: opts.requestingAgentId,
      userId: null,
      runId: opts.runId ?? null,
      before: null,
      after: approval as Record<string, unknown>,
      createdAt: now,
    });

    return approval!;
  }

  async list(opts: ListApprovalsOptions) {
    const conditions = [eq(approvals.companyId, opts.companyId)];

    if (opts.status) {
      conditions.push(eq(approvals.status, opts.status));
    }
    if (opts.requestingAgentId) {
      conditions.push(eq(approvals.requestingAgentId, opts.requestingAgentId));
    }

    const rows = await this.db
      .select()
      .from(approvals)
      .where(and(...conditions))
      .orderBy(approvals.createdAt);

    return rows;
  }

  async get(approvalId: string) {
    const [row] = await this.db
      .select()
      .from(approvals)
      .where(eq(approvals.id, approvalId))
      .limit(1);

    if (!row) throw new NotFoundError("Approval", approvalId);

    const links = await this.db
      .select()
      .from(approvalIssueLinks)
      .where(eq(approvalIssueLinks.approvalId, approvalId));

    return { ...row, linkedIssues: links };
  }

  async getLinkedIssues(approvalId: string) {
    const links = await this.db
      .select()
      .from(approvalIssueLinks)
      .where(eq(approvalIssueLinks.approvalId, approvalId));

    if (links.length === 0) return [];

    const issueIds = links.map((l) => l.issueId);
    return this.db
      .select()
      .from(issues)
      .where(inArray(issues.id, issueIds));
  }

  async resolve(opts: ResolveApprovalOptions) {
    const existing = await this.get(opts.approvalId);

    if (existing.companyId !== opts.companyId) {
      throw new ForbiddenError("Approval not in your company");
    }

    if (existing.status !== "pending") {
      throw new ValidationError(
        `Approval is already ${existing.status} and cannot be resolved again`,
      );
    }

    if (!opts.resolvedByAgentId && !opts.resolvedByUserId) {
      throw new ValidationError("resolver identity is required");
    }

    const now = new Date();

    const [updated] = await this.db
      .update(approvals)
      .set({
        status: opts.status,
        resolvedByAgentId: opts.resolvedByAgentId ?? null,
        resolvedByUserId: opts.resolvedByUserId ?? null,
        resolvedAt: now,
        updatedAt: now,
      })
      .where(eq(approvals.id, opts.approvalId))
      .returning();

    // Audit
    await this.db.insert(auditLog).values({
      id: randomUUID(),
      companyId: opts.companyId,
      entityType: "approval",
      entityId: opts.approvalId,
      action: `approval.${opts.status}`,
      agentId: opts.resolvedByAgentId ?? null,
      userId: opts.resolvedByUserId ?? null,
      runId: null,
      before: existing as Record<string, unknown>,
      after: updated as Record<string, unknown>,
      createdAt: now,
    });

    return updated!;
  }
}
