import { Router } from "express";
import { z } from "zod";
import { getDb } from "../db/client.js";
import { GoalService } from "../services/goal.service.js";
import { requireAuth, runIdHeader } from "../middleware/auth.js";

const router = Router();

// ─── List goals ───────────────────────────────────────────────────────────────

router.get(
  "/companies/:companyId/goals",
  requireAuth,
  async (req, res) => {
    const { companyId } = req.params;

    if (req.auth.companyId !== companyId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const svc = new GoalService(getDb());
    const result = await svc.list(companyId!);
    res.json(result);
  },
);

// ─── Create goal ──────────────────────────────────────────────────────────────

const CreateGoalSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  level: z.enum(["company", "team", "individual"]).optional(),
  status: z.enum(["active", "paused", "completed", "cancelled"]).optional(),
  parentId: z.string().uuid().optional(),
  ownerAgentId: z.string().uuid().optional(),
});

router.post(
  "/companies/:companyId/goals",
  requireAuth,
  runIdHeader,
  async (req, res) => {
    const { companyId } = req.params;

    if (req.auth.companyId !== companyId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const parsed = CreateGoalSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const svc = new GoalService(getDb());
    const goal = await svc.create({
      companyId: companyId!,
      title: parsed.data.title,
      description: parsed.data.description,
      level: parsed.data.level,
      status: parsed.data.status,
      parentId: parsed.data.parentId,
      ownerAgentId: parsed.data.ownerAgentId,
      actorAgentId: req.auth.agentId,
      actorUserId: req.auth.userId,
    });

    res.status(201).json(goal);
  },
);

// ─── Get goal ─────────────────────────────────────────────────────────────────

router.get("/goals/:goalId", requireAuth, async (req, res) => {
  const svc = new GoalService(getDb());
  const goal = await svc.get(String(req.params["goalId"]));

  if (goal.companyId !== req.auth.companyId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  res.json(goal);
});

// ─── Update goal ──────────────────────────────────────────────────────────────

const UpdateGoalSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  level: z.enum(["company", "team", "individual"]).optional(),
  status: z.enum(["active", "paused", "completed", "cancelled"]).optional(),
  parentId: z.string().uuid().nullable().optional(),
  ownerAgentId: z.string().uuid().nullable().optional(),
});

router.patch(
  "/goals/:goalId",
  requireAuth,
  runIdHeader,
  async (req, res) => {
    const parsed = UpdateGoalSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const goalId = String(req.params["goalId"]);
    const svc = new GoalService(getDb());
    const updated = await svc.update({
      goalId,
      companyId: req.auth.companyId,
      fields: {
        title: parsed.data.title,
        description: parsed.data.description,
        level: parsed.data.level,
        status: parsed.data.status,
        parentId: parsed.data.parentId,
        ownerAgentId: parsed.data.ownerAgentId,
      },
      actorAgentId: req.auth.agentId,
      actorUserId: req.auth.userId,
    });

    res.json(updated);
  },
);

export default router;
