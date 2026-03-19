import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getDb } from "../db/client.js";
import { BudgetService } from "../services/budget.service.js";

const router = Router();

// ─── Get Budget Status ────────────────────────────────────────────────────────

router.get("/agents/:agentId/budget", requireAuth, async (req, res) => {
  const agentId = String(req.params["agentId"]);

  // Agents can only check their own budget; users can check any in their company
  if (req.auth.agentId && req.auth.agentId !== agentId) {
    res.status(403).json({ error: "Agents can only view their own budget" });
    return;
  }

  const svc = new BudgetService(getDb());
  const status = await svc.getStatus(agentId);

  if (!req.auth.userId && status.agentId !== req.auth.agentId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  res.json(status);
});

// ─── Record Spend ─────────────────────────────────────────────────────────────

router.post("/agents/:agentId/spend", requireAuth, async (req, res) => {
  const agentId = String(req.params["agentId"]);

  // Only the agent itself or its runtime can record spend
  if (req.auth.agentId && req.auth.agentId !== agentId) {
    res.status(403).json({ error: "Agents can only record their own spend" });
    return;
  }

  const { amountCents } = req.body as { amountCents?: number };

  if (typeof amountCents !== "number" || amountCents <= 0) {
    res.status(400).json({ error: "amountCents must be a positive number" });
    return;
  }

  const svc = new BudgetService(getDb());
  const updated = await svc.recordSpend({
    agentId,
    companyId: req.auth.companyId,
    runId: req.auth.runId,
    amountCents,
  });

  res.json(updated);
});

export default router;
