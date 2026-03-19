import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "../db/client.js";
import { agents } from "../db/schema.js";
import { requireAuth, runIdHeader } from "../middleware/auth.js";
import { NotFoundError, ForbiddenError } from "@agentic/core";

const router = Router();

router.get("/agents/me", requireAuth, async (req, res) => {
  const { agentId, companyId } = req.auth;

  if (!agentId) {
    res.status(400).json({ error: "Token does not represent an agent" });
    return;
  }

  const [agent] = await getDb()
    .select()
    .from(agents)
    .where(eq(agents.id, agentId))
    .limit(1);

  if (!agent || agent.companyId !== companyId) {
    res.status(404).json({ error: "Agent not found" });
    return;
  }

  // Build chain of command
  const chain = [];
  let currentId = agent.reportsTo;
  const seen = new Set<string>();

  while (currentId && !seen.has(currentId)) {
    seen.add(currentId);
    const [mgr] = await getDb()
      .select()
      .from(agents)
      .where(eq(agents.id, currentId))
      .limit(1);

    if (!mgr) break;
    chain.push({ id: mgr.id, name: mgr.name, role: mgr.role, title: mgr.title });
    currentId = mgr.reportsTo;
  }

  res.json({ ...agent, chainOfCommand: chain });
});

router.get(
  "/companies/:companyId/agents",
  requireAuth,
  async (req, res) => {
    const { companyId } = req.params;

    if (req.auth.companyId !== companyId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const result = await getDb()
      .select()
      .from(agents)
      .where(eq(agents.companyId, companyId!));

    res.json(result);
  },
);

// ─── Update agent ─────────────────────────────────────────────────────────────

const UpdateAgentSchema = z.object({
  name: z.string().min(1).optional(),
  title: z.string().nullable().optional(),
  capabilities: z.string().nullable().optional(),
  status: z.enum(["idle", "busy", "paused"]).optional(),
  adapterConfig: z.record(z.unknown()).optional(),
  runtimeConfig: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
});

router.patch(
  "/agents/:agentId",
  requireAuth,
  runIdHeader,
  async (req, res) => {
    const agentId = String(req.params["agentId"]);
    const db = getDb();

    const [agent] = await db
      .select()
      .from(agents)
      .where(and(eq(agents.id, agentId), eq(agents.companyId, req.auth.companyId)))
      .limit(1);

    if (!agent) throw new NotFoundError("Agent", agentId);

    // Only the agent itself or a manager in its chain may update it
    const isSelf = req.auth.agentId === agentId;
    if (!isSelf) {
      // Walk the reports-to chain
      let cursor = agent.reportsTo;
      let allowed = false;
      const seen = new Set<string>();
      while (cursor && !seen.has(cursor)) {
        seen.add(cursor);
        if (cursor === req.auth.agentId) { allowed = true; break; }
        const [mgr] = await db.select().from(agents).where(eq(agents.id, cursor)).limit(1);
        cursor = mgr?.reportsTo ?? null;
      }
      if (!allowed) throw new ForbiddenError("Only the agent itself or its manager may update it");
    }

    const parsed = UpdateAgentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (parsed.data.name !== undefined) updateData["name"] = parsed.data.name;
    if (parsed.data.title !== undefined) updateData["title"] = parsed.data.title;
    if (parsed.data.capabilities !== undefined) updateData["capabilities"] = parsed.data.capabilities;
    if (parsed.data.status !== undefined) updateData["status"] = parsed.data.status;
    if (parsed.data.adapterConfig !== undefined) updateData["adapterConfig"] = parsed.data.adapterConfig;
    if (parsed.data.runtimeConfig !== undefined) updateData["runtimeConfig"] = parsed.data.runtimeConfig;
    if (parsed.data.metadata !== undefined) updateData["metadata"] = parsed.data.metadata;

    const [updated] = await db
      .update(agents)
      .set(updateData)
      .where(eq(agents.id, agentId))
      .returning();

    res.json(updated);
  },
);

// ─── Set instructions path ────────────────────────────────────────────────────

const SetInstructionsPathSchema = z.object({
  path: z.string().nullable(),
  adapterConfigKey: z.string().optional(),
});

router.patch(
  "/agents/:agentId/instructions-path",
  requireAuth,
  runIdHeader,
  async (req, res) => {
    const agentId = String(req.params["agentId"]);
    const db = getDb();

    const [agent] = await db
      .select()
      .from(agents)
      .where(and(eq(agents.id, agentId), eq(agents.companyId, req.auth.companyId)))
      .limit(1);

    if (!agent) throw new NotFoundError("Agent", agentId);

    // Only the agent itself or an ancestor manager may set the instructions path
    const isSelf = req.auth.agentId === agentId;
    if (!isSelf) {
      let cursor = agent.reportsTo;
      let allowed = false;
      const seen = new Set<string>();
      while (cursor && !seen.has(cursor)) {
        seen.add(cursor);
        if (cursor === req.auth.agentId) { allowed = true; break; }
        const [mgr] = await db.select().from(agents).where(eq(agents.id, cursor)).limit(1);
        cursor = mgr?.reportsTo ?? null;
      }
      if (!allowed) throw new ForbiddenError("Only the agent itself or its manager may set the instructions path");
    }

    const parsed = SetInstructionsPathSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    // Update instructionsPath column
    const [updated] = await db
      .update(agents)
      .set({ instructionsPath: parsed.data.path, updatedAt: new Date() })
      .where(eq(agents.id, agentId))
      .returning();

    // Also sync into adapterConfig if key provided
    if (parsed.data.adapterConfigKey && typeof agent.adapterConfig === "object" && agent.adapterConfig) {
      const newConfig = {
        ...(agent.adapterConfig as Record<string, unknown>),
        [parsed.data.adapterConfigKey]: parsed.data.path,
      };
      await db.update(agents).set({ adapterConfig: newConfig }).where(eq(agents.id, agentId));
    }

    res.json(updated);
  },
);

export default router;
