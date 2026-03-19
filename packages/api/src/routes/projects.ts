import { Router } from "express";
import { z } from "zod";
import { getDb } from "../db/client.js";
import { ProjectService } from "../services/project.service.js";
import { requireAuth, runIdHeader } from "../middleware/auth.js";

const router = Router();

// ─── List projects ────────────────────────────────────────────────────────────

router.get(
  "/companies/:companyId/projects",
  requireAuth,
  async (req, res) => {
    const { companyId } = req.params;

    if (req.auth.companyId !== companyId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const svc = new ProjectService(getDb());
    const result = await svc.list(companyId!);
    res.json(result);
  },
);

// ─── Create project ───────────────────────────────────────────────────────────

const CreateProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["planning", "in_progress", "on_hold", "completed", "cancelled"]).optional(),
  leadAgentId: z.string().uuid().optional(),
  targetDate: z.string().datetime().optional(),
  color: z.string().optional(),
  workspace: z
    .object({
      name: z.string().optional(),
      cwd: z.string().optional(),
      repoUrl: z.string().url().optional(),
      repoRef: z.string().optional(),
      runtimeServices: z.array(z.unknown()).optional(),
      metadata: z.unknown().optional(),
    })
    .optional(),
});

router.post(
  "/companies/:companyId/projects",
  requireAuth,
  runIdHeader,
  async (req, res) => {
    const { companyId } = req.params;

    if (req.auth.companyId !== companyId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const parsed = CreateProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const svc = new ProjectService(getDb());
    const project = await svc.create({
      companyId: companyId!,
      name: parsed.data.name,
      description: parsed.data.description,
      status: parsed.data.status,
      leadAgentId: parsed.data.leadAgentId,
      color: parsed.data.color,
      workspace: parsed.data.workspace,
      targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : undefined,
      actorAgentId: req.auth.agentId,
      actorUserId: req.auth.userId,
    });

    res.status(201).json(project);
  },
);

// ─── Get project ──────────────────────────────────────────────────────────────

router.get("/projects/:projectId", requireAuth, async (req, res) => {
  const svc = new ProjectService(getDb());
  const project = await svc.get(String(req.params["projectId"]));

  if (project.companyId !== req.auth.companyId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  res.json(project);
});

// ─── Update project ───────────────────────────────────────────────────────────

const UpdateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.string().optional(),
  leadAgentId: z.string().uuid().nullable().optional(),
  targetDate: z.string().datetime().nullable().optional(),
  color: z.string().nullable().optional(),
});

router.patch(
  "/projects/:projectId",
  requireAuth,
  runIdHeader,
  async (req, res) => {
    const parsed = UpdateProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const projectId = String(req.params["projectId"]);
    const svc = new ProjectService(getDb());
    const updated = await svc.update({
      projectId,
      companyId: req.auth.companyId,
      fields: {
        name: parsed.data.name,
        description: parsed.data.description,
        status: parsed.data.status,
        leadAgentId: parsed.data.leadAgentId,
        color: parsed.data.color,
        targetDate:
          parsed.data.targetDate === null
            ? null
            : parsed.data.targetDate
            ? new Date(parsed.data.targetDate)
            : undefined,
      },
      actorAgentId: req.auth.agentId,
      actorUserId: req.auth.userId,
    });

    res.json(updated);
  },
);

// ─── Create workspace ─────────────────────────────────────────────────────────

const CreateWorkspaceSchema = z.object({
  name: z.string().optional(),
  cwd: z.string().optional(),
  repoUrl: z.string().url().optional(),
  repoRef: z.string().optional(),
  runtimeServices: z.array(z.unknown()).optional(),
  metadata: z.unknown().optional(),
});

router.post(
  "/projects/:projectId/workspaces",
  requireAuth,
  runIdHeader,
  async (req, res) => {
    const parsed = CreateWorkspaceSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const projectId = String(req.params["projectId"]);
    const svc = new ProjectService(getDb());
    // Verify project ownership
    const project = await svc.get(projectId);
    if (project.companyId !== req.auth.companyId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const workspace = await svc.createWorkspace({
      projectId,
      companyId: req.auth.companyId,
      name: parsed.data.name,
      cwd: parsed.data.cwd,
      repoUrl: parsed.data.repoUrl,
      repoRef: parsed.data.repoRef,
      runtimeServices: parsed.data.runtimeServices,
      metadata: parsed.data.metadata,
      actorAgentId: req.auth.agentId,
    });

    res.status(201).json(workspace);
  },
);

export default router;
