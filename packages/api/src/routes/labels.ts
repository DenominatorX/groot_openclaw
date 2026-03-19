import { Router } from "express";
import { z } from "zod";
import { getDb } from "../db/client.js";
import { LabelService } from "../services/label.service.js";
import { requireAuth, runIdHeader } from "../middleware/auth.js";

const router = Router();

// ─── List labels ──────────────────────────────────────────────────────────────

router.get(
  "/companies/:companyId/labels",
  requireAuth,
  async (req, res) => {
    const { companyId } = req.params;

    if (req.auth.companyId !== companyId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const svc = new LabelService(getDb());
    res.json(await svc.list(companyId!));
  },
);

// ─── Create label ─────────────────────────────────────────────────────────────

const CreateLabelSchema = z.object({
  name: z.string().min(1),
  color: z.string().optional(),
});

router.post(
  "/companies/:companyId/labels",
  requireAuth,
  runIdHeader,
  async (req, res) => {
    const { companyId } = req.params;

    if (req.auth.companyId !== companyId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const parsed = CreateLabelSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const svc = new LabelService(getDb());
    const label = await svc.create(companyId!, parsed.data.name, parsed.data.color);
    res.status(201).json(label);
  },
);

// ─── Delete label ─────────────────────────────────────────────────────────────

router.delete(
  "/labels/:labelId",
  requireAuth,
  runIdHeader,
  async (req, res) => {
    const svc = new LabelService(getDb());
    await svc.delete(String(req.params["labelId"]), req.auth.companyId);
    res.status(204).end();
  },
);

// ─── Set labels on an issue ───────────────────────────────────────────────────

const SetIssueLabelsSchema = z.object({ labelIds: z.array(z.string().uuid()) });

router.put(
  "/issues/:issueId/labels",
  requireAuth,
  runIdHeader,
  async (req, res) => {
    const parsed = SetIssueLabelsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "labelIds (array of UUIDs) is required" });
      return;
    }

    const svc = new LabelService(getDb());
    await svc.setIssueLabels(String(req.params["issueId"]), parsed.data.labelIds);
    res.status(204).end();
  },
);

export default router;
