import { eq, and } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import type { Db } from "../db/client.js";
import { goals, auditLog } from "../db/schema.js";
import { NotFoundError } from "@agentic/core";

export interface CreateGoalOptions {
  companyId: string;
  title: string;
  description?: string | undefined;
  level?: string | undefined;
  status?: string | undefined;
  parentId?: string | undefined;
  ownerAgentId?: string | undefined;
  actorAgentId?: string | undefined;
  actorUserId?: string | undefined;
}

export interface UpdateGoalOptions {
  goalId: string;
  companyId: string;
  fields: {
    title?: string | undefined;
    description?: string | null | undefined;
    level?: string | undefined;
    status?: string | undefined;
    parentId?: string | null | undefined;
    ownerAgentId?: string | null | undefined;
  };
  actorAgentId?: string | undefined;
  actorUserId?: string | undefined;
}

export class GoalService {
  constructor(private db: Db) {}

  async list(companyId: string) {
    return this.db
      .select()
      .from(goals)
      .where(eq(goals.companyId, companyId))
      .orderBy(goals.createdAt);
  }

  async get(goalId: string) {
    const [goal] = await this.db
      .select()
      .from(goals)
      .where(eq(goals.id, goalId))
      .limit(1);

    if (!goal) throw new NotFoundError("Goal", goalId);
    return goal;
  }

  async create(opts: CreateGoalOptions) {
    const id = randomUUID();

    const [goal] = await this.db
      .insert(goals)
      .values({
        id,
        companyId: opts.companyId,
        title: opts.title.trim(),
        description: opts.description,
        level: opts.level ?? "company",
        status: opts.status ?? "active",
        parentId: opts.parentId,
        ownerAgentId: opts.ownerAgentId,
      })
      .returning();

    await this.db.insert(auditLog).values({
      id: randomUUID(),
      companyId: opts.companyId,
      entityType: "goal",
      entityId: id,
      action: "create",
      agentId: opts.actorAgentId ?? null,
      userId: opts.actorUserId ?? null,
      runId: null,
      before: null,
      after: goal as Record<string, unknown>,
    });

    return goal!;
  }

  async update(opts: UpdateGoalOptions) {
    const [existing] = await this.db
      .select()
      .from(goals)
      .where(and(eq(goals.id, opts.goalId), eq(goals.companyId, opts.companyId)))
      .limit(1);

    if (!existing) throw new NotFoundError("Goal", opts.goalId);

    const updateData: Partial<typeof existing> = { updatedAt: new Date() };
    if (opts.fields.title !== undefined) updateData.title = opts.fields.title;
    if (opts.fields.description !== undefined) updateData.description = opts.fields.description;
    if (opts.fields.level !== undefined) updateData.level = opts.fields.level;
    if (opts.fields.status !== undefined) updateData.status = opts.fields.status;
    if (opts.fields.parentId !== undefined) updateData.parentId = opts.fields.parentId;
    if (opts.fields.ownerAgentId !== undefined) updateData.ownerAgentId = opts.fields.ownerAgentId;

    const [updated] = await this.db
      .update(goals)
      .set(updateData)
      .where(eq(goals.id, opts.goalId))
      .returning();

    await this.db.insert(auditLog).values({
      id: randomUUID(),
      companyId: opts.companyId,
      entityType: "goal",
      entityId: opts.goalId,
      action: "update",
      agentId: opts.actorAgentId ?? null,
      userId: opts.actorUserId ?? null,
      runId: null,
      before: existing as Record<string, unknown>,
      after: updated as Record<string, unknown>,
    });

    return updated!;
  }
}
