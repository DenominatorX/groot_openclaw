import { Router } from "express";
import { eq } from "drizzle-orm";
import { getDb } from "../db/client.js";
import { agents } from "../db/schema.js";
import { requireAuth } from "../middleware/auth.js";
import { NotFoundError } from "@agentic/core";

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

export default router;
