import { Router } from "express";
import { getDb } from "../db/client.js";
import { DashboardService } from "../services/dashboard.service.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get(
  "/companies/:companyId/dashboard",
  requireAuth,
  async (req, res) => {
    const { companyId } = req.params;

    if (req.auth.companyId !== companyId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const svc = new DashboardService(getDb());
    const metrics = await svc.getMetrics(companyId!);
    res.json(metrics);
  },
);

export default router;
