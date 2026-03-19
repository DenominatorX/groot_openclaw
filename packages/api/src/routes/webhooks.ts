import { Router } from "express";
import { z } from "zod";
import { getDb } from "../db/client.js";
import { WebhookService } from "../services/webhook.service.js";
import { requireAuth, runIdHeader } from "../middleware/auth.js";

const router = Router();

const VALID_EVENTS = [
  "issue.created",
  "issue.updated",
  "issue.status_changed",
  "issue.assigned",
  "issue.commented",
  "approval.created",
  "approval.resolved",
] as const;

// ─── List webhooks ────────────────────────────────────────────────────────────

router.get(
  "/companies/:companyId/webhooks",
  requireAuth,
  async (req, res) => {
    const { companyId } = req.params;

    if (req.auth.companyId !== companyId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const svc = new WebhookService(getDb());
    res.json(await svc.listForCompany(companyId!));
  },
);

// ─── Create webhook ───────────────────────────────────────────────────────────

const CreateWebhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.enum(VALID_EVENTS)).min(1),
  secret: z.string().optional(),
});

router.post(
  "/companies/:companyId/webhooks",
  requireAuth,
  runIdHeader,
  async (req, res) => {
    const { companyId } = req.params;

    if (req.auth.companyId !== companyId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const parsed = CreateWebhookSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const svc = new WebhookService(getDb());
    const hook = await svc.create(
      companyId!,
      parsed.data.url,
      parsed.data.events,
      parsed.data.secret,
    );

    res.status(201).json(hook);
  },
);

// ─── Delete webhook ───────────────────────────────────────────────────────────

router.delete(
  "/webhooks/:webhookId",
  requireAuth,
  runIdHeader,
  async (req, res) => {
    const svc = new WebhookService(getDb());
    await svc.delete(String(req.params["webhookId"]), req.auth.companyId);
    res.status(204).end();
  },
);

export default router;
