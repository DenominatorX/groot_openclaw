import { eq, and } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import type { Db } from "../db/client.js";
import { projects, projectWorkspaces, auditLog } from "../db/schema.js";
import { NotFoundError, ValidationError } from "@agentic/core";

export interface CreateProjectOptions {
  companyId: string;
  name: string;
  description?: string | undefined;
  status?: string | undefined;
  leadAgentId?: string | undefined;
  targetDate?: Date | undefined;
  color?: string | undefined;
  workspace?: {
    name?: string | undefined;
    cwd?: string | undefined;
    repoUrl?: string | undefined;
    repoRef?: string | undefined;
    runtimeServices?: unknown[] | undefined;
    metadata?: unknown | undefined;
  } | undefined;
  actorAgentId?: string | undefined;
  actorUserId?: string | undefined;
}

export interface UpdateProjectOptions {
  projectId: string;
  companyId: string;
  fields: {
    name?: string | undefined;
    description?: string | null | undefined;
    status?: string | undefined;
    leadAgentId?: string | null | undefined;
    targetDate?: Date | null | undefined;
    color?: string | null | undefined;
  };
  actorAgentId?: string | undefined;
  actorUserId?: string | undefined;
}

export interface CreateWorkspaceOptions {
  projectId: string;
  companyId: string;
  name?: string | undefined;
  cwd?: string | undefined;
  repoUrl?: string | undefined;
  repoRef?: string | undefined;
  runtimeServices?: unknown[] | undefined;
  metadata?: unknown | undefined;
  actorAgentId?: string | undefined;
}

export class ProjectService {
  constructor(private db: Db) {}

  async list(companyId: string) {
    const rows = await this.db
      .select()
      .from(projects)
      .where(and(eq(projects.companyId, companyId)))
      .orderBy(projects.createdAt);

    const workspaces = await this.db
      .select()
      .from(projectWorkspaces)
      .where(eq(projectWorkspaces.companyId, companyId));

    return rows.map((p) => ({
      ...p,
      workspaces: workspaces.filter((w) => w.projectId === p.id),
      primaryWorkspace: workspaces.find((w) => w.projectId === p.id && w.isPrimary) ?? null,
    }));
  }

  async get(projectId: string) {
    const [project] = await this.db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) throw new NotFoundError("Project", projectId);

    const workspaces = await this.db
      .select()
      .from(projectWorkspaces)
      .where(eq(projectWorkspaces.projectId, projectId));

    return {
      ...project,
      workspaces,
      primaryWorkspace: workspaces.find((w) => w.isPrimary) ?? null,
    };
  }

  async create(opts: CreateProjectOptions) {
    if (!opts.name?.trim()) throw new ValidationError("name is required");

    const urlKey = opts.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const id = randomUUID();

    const [project] = await this.db
      .insert(projects)
      .values({
        id,
        companyId: opts.companyId,
        name: opts.name.trim(),
        description: opts.description,
        status: opts.status ?? "in_progress",
        leadAgentId: opts.leadAgentId,
        targetDate: opts.targetDate,
        color: opts.color ?? "#6366f1",
        urlKey,
      })
      .returning();

    await this.db.insert(auditLog).values({
      id: randomUUID(),
      companyId: opts.companyId,
      entityType: "project",
      entityId: id,
      action: "create",
      agentId: opts.actorAgentId ?? null,
      userId: opts.actorUserId ?? null,
      runId: null,
      before: null,
      after: project as Record<string, unknown>,
    });

    let workspace = null;
    if (opts.workspace && (opts.workspace.cwd || opts.workspace.repoUrl)) {
      workspace = await this.createWorkspace({
        projectId: id,
        companyId: opts.companyId,
        name: opts.workspace.name ?? "default",
        cwd: opts.workspace.cwd,
        repoUrl: opts.workspace.repoUrl,
        repoRef: opts.workspace.repoRef,
        runtimeServices: opts.workspace.runtimeServices,
        metadata: opts.workspace.metadata,
        actorAgentId: opts.actorAgentId,
      });
    }

    return {
      ...project!,
      workspaces: workspace ? [workspace] : [],
      primaryWorkspace: workspace,
    };
  }

  async update(opts: UpdateProjectOptions) {
    const [existing] = await this.db
      .select()
      .from(projects)
      .where(and(eq(projects.id, opts.projectId), eq(projects.companyId, opts.companyId)))
      .limit(1);

    if (!existing) throw new NotFoundError("Project", opts.projectId);

    const updateData: Partial<typeof existing> = { updatedAt: new Date() };
    if (opts.fields.name !== undefined) updateData.name = opts.fields.name;
    if (opts.fields.description !== undefined) updateData.description = opts.fields.description;
    if (opts.fields.status !== undefined) updateData.status = opts.fields.status;
    if (opts.fields.leadAgentId !== undefined) updateData.leadAgentId = opts.fields.leadAgentId;
    if (opts.fields.targetDate !== undefined) updateData.targetDate = opts.fields.targetDate;
    if (opts.fields.color !== undefined) updateData.color = opts.fields.color;

    const [updated] = await this.db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, opts.projectId))
      .returning();

    await this.db.insert(auditLog).values({
      id: randomUUID(),
      companyId: opts.companyId,
      entityType: "project",
      entityId: opts.projectId,
      action: "update",
      agentId: opts.actorAgentId ?? null,
      userId: opts.actorUserId ?? null,
      runId: null,
      before: existing as Record<string, unknown>,
      after: updated as Record<string, unknown>,
    });

    const workspaces = await this.db
      .select()
      .from(projectWorkspaces)
      .where(eq(projectWorkspaces.projectId, opts.projectId));

    return {
      ...updated!,
      workspaces,
      primaryWorkspace: workspaces.find((w) => w.isPrimary) ?? null,
    };
  }

  async createWorkspace(opts: CreateWorkspaceOptions) {
    if (!opts.cwd && !opts.repoUrl) {
      throw new ValidationError("workspace requires at least one of: cwd, repoUrl");
    }

    // Check if a primary workspace already exists
    const existing = await this.db
      .select()
      .from(projectWorkspaces)
      .where(
        and(
          eq(projectWorkspaces.projectId, opts.projectId),
          eq(projectWorkspaces.isPrimary, true),
        ),
      );

    const isPrimary = existing.length === 0;

    const id = randomUUID();

    const [workspace] = await this.db
      .insert(projectWorkspaces)
      .values({
        id,
        companyId: opts.companyId,
        projectId: opts.projectId,
        name: opts.name ?? "default",
        cwd: opts.cwd,
        repoUrl: opts.repoUrl,
        repoRef: opts.repoRef,
        isPrimary,
        runtimeServices: opts.runtimeServices ?? [],
        metadata: opts.metadata ?? null,
      })
      .returning();

    return workspace!;
  }
}
