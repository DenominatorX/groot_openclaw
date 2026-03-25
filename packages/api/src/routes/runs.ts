import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "../db/client.js";
import { agentRuns, agents } from "../db/schema.js";
import { requireAuth } from "../middleware/auth.js";
import { NotFoundError } from "@agentic/core";

const router = Router();

// ─── Create a run ────────────────────────────────────────────────────────────

const CreateRunSchema = z.object({
  id: z.string().min(1),
  invocationSource: z.enum(["assignment", "mention", "schedule", "manual"]),
  triggerDetail: z.string().optional(),
  contextVars: z.record(z.unknown()).optional(),
});

router.post(
  "/agents/:agentId/runs",
  requireAuth,
  async (req, res) => {
    const agentId = String(req.params["agentId"]);
    const db = getDb();

    // Verify agent exists and belongs to the caller's company
    const [agent] = await db
      .select()
      .from(agents)
      .where(and(eq(agents.id, agentId), eq(agents.companyId, req.auth.companyId)))
      .limit(1);

    if (!agent) throw new NotFoundError("Agent", agentId);

    const parsed = CreateRunSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [run] = await db
      .insert(agentRuns)
      .values({
        id: parsed.data.id,
        agentId,
        companyId: req.auth.companyId,
        status: "running",
        invocationSource: parsed.data.invocationSource,
        triggerDetail: parsed.data.triggerDetail ?? null,
        contextVars: parsed.data.contextVars ?? {},
        startedAt: new Date(),
      })
      .returning();

    res.status(201).json(run);
  },
);

// ─── Update a run (complete / fail) ──────────────────────────────────────────

const UpdateRunSchema = z.object({
  status: z.enum(["completed", "failed", "cancelled"]),
  finishedAt: z.string().datetime().optional(),
  error: z.string().optional(),
  errorCode: z.string().optional(),
  errorContext: z.record(z.unknown()).optional(),
});

router.patch(
  "/runs/:runId",
  requireAuth,
  async (req, res) => {
    const runId = String(req.params["runId"]);
    const db = getDb();

    const [run] = await db
      .select()
      .from(agentRuns)
      .where(and(eq(agentRuns.id, runId), eq(agentRuns.companyId, req.auth.companyId)))
      .limit(1);

    if (!run) throw new NotFoundError("Run", runId);

    const parsed = UpdateRunSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const updateData: Record<string, unknown> = {
      status: parsed.data.status,
      finishedAt: parsed.data.finishedAt ? new Date(parsed.data.finishedAt) : new Date(),
      updatedAt: new Date(),
    };

    if (parsed.data.error !== undefined) updateData["error"] = parsed.data.error;
    if (parsed.data.errorCode !== undefined) updateData["errorCode"] = parsed.data.errorCode;
    if (parsed.data.errorContext !== undefined) updateData["errorContext"] = parsed.data.errorContext;

    const [updated] = await db
      .update(agentRuns)
      .set(updateData)
      .where(eq(agentRuns.id, runId))
      .returning();

    res.json(updated);
  },
);

export default router;
