import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getDb } from "../db/client.js";
import { AuditService } from "../services/audit.service.js";

const router = Router();

router.get(
  "/companies/:companyId/audit",
  requireAuth,
  async (req, res) => {
    const { companyId } = req.params;

    if (req.auth.companyId !== companyId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const {
      entityType,
      entityId,
      agentId,
      userId,
      runId,
      action,
      from,
      to,
      limit,
      offset,
    } = req.query as Record<string, string | undefined>;

    const svc = new AuditService(getDb());
    const entries = await svc.query({
      companyId: companyId!,
      entityType,
      entityId,
      agentId,
      userId,
      runId,
      action,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });

    res.json(entries);
  },
);

export default router;
