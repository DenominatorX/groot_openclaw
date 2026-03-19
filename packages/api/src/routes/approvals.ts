import { Router } from "express";
import { getDb } from "../db/client.js";
import { requireAuth } from "../middleware/auth.js";
import { ApprovalService } from "../services/approval.service.js";

const router = Router();

// ─── Create Approval ──────────────────────────────────────────────────────────

router.post(
  "/companies/:companyId/approvals",
  requireAuth,
  async (req, res) => {
    const { companyId } = req.params;

    if (req.auth.companyId !== companyId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    if (!req.auth.agentId) {
      res.status(400).json({ error: "Only agents can request approvals" });
      return;
    }

    const { title, description, linkedIssueIds } = req.body as {
      title?: string;
      description?: string;
      linkedIssueIds?: string[];
    };

    const svc = new ApprovalService(getDb());
    const approval = await svc.create({
      companyId: companyId!,
      requestingAgentId: req.auth.agentId,
      runId: req.auth.runId ?? undefined,
      title: title ?? "",
      description,
      linkedIssueIds,
    });

    res.status(201).json(approval);
  },
);

// ─── List Approvals ───────────────────────────────────────────────────────────

router.get(
  "/companies/:companyId/approvals",
  requireAuth,
  async (req, res) => {
    const { companyId } = req.params;

    if (req.auth.companyId !== companyId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const { status, requestingAgentId } = req.query as {
      status?: "pending" | "approved" | "rejected";
      requestingAgentId?: string;
    };

    const svc = new ApprovalService(getDb());
    const result = await svc.list({
      companyId: companyId!,
      status,
      requestingAgentId,
    });

    res.json(result);
  },
);

// ─── Get Single Approval ──────────────────────────────────────────────────────

router.get("/approvals/:approvalId", requireAuth, async (req, res) => {
  const { approvalId } = req.params;
  const svc = new ApprovalService(getDb());
  const approval = await svc.get(approvalId!);

  if (approval.companyId !== req.auth.companyId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  res.json(approval);
});

// ─── Get Linked Issues ────────────────────────────────────────────────────────

router.get(
  "/approvals/:approvalId/issues",
  requireAuth,
  async (req, res) => {
    const { approvalId } = req.params;
    const svc = new ApprovalService(getDb());
    const approval = await svc.get(approvalId!);

    if (approval.companyId !== req.auth.companyId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const linked = await svc.getLinkedIssues(approvalId!);
    res.json(linked);
  },
);

// ─── Resolve Approval ─────────────────────────────────────────────────────────

router.patch("/approvals/:approvalId", requireAuth, async (req, res) => {
  const { approvalId } = req.params;

  // Only board users can resolve approvals
  const isUser = !!req.auth.userId;
  if (!isUser) {
    res.status(403).json({
      error: "Only board users can resolve approvals",
    });
    return;
  }

  const { status } = req.body as { status?: "approved" | "rejected" };

  if (status !== "approved" && status !== "rejected") {
    res.status(400).json({ error: "status must be 'approved' or 'rejected'" });
    return;
  }

  const svc = new ApprovalService(getDb());
  const updated = await svc.resolve({
    approvalId: approvalId!,
    companyId: req.auth.companyId,
    status,
    resolvedByAgentId: req.auth.agentId ?? undefined,
    resolvedByUserId: req.auth.userId ?? undefined,
  });

  res.json(updated);
});

export default router;
