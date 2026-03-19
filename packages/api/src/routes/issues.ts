import { Router } from "express";
import { z } from "zod";
import { getDb } from "../db/client.js";
import { IssueService } from "../services/issue.service.js";
import { requireAuth, runIdHeader } from "../middleware/auth.js";
import { ValidationError, ConflictError, NotFoundError } from "@agentic/core";

const router = Router();

// ─── List issues ──────────────────────────────────────────────────────────────

router.get(
  "/companies/:companyId/issues",
  requireAuth,
  runIdHeader,
  async (req, res) => {
    const { companyId } = req.params;

    if (req.auth.companyId !== companyId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const { status, assigneeAgentId, projectId, goalId, labelId, q, limit, offset } = req.query;

    const svc = new IssueService(getDb());
    const statusArr = status
      ? (String(status).split(",") as import("@agentic/core").IssueStatus[])
      : undefined;

    const result = await svc.list({
      companyId,
      status: statusArr,
      assigneeAgentId: assigneeAgentId ? String(assigneeAgentId) : undefined,
      projectId: projectId ? String(projectId) : undefined,
      goalId: goalId ? String(goalId) : undefined,
      labelId: labelId ? String(labelId) : undefined,
      q: q ? String(q) : undefined,
      limit: limit ? parseInt(String(limit), 10) : undefined,
      offset: offset ? parseInt(String(offset), 10) : undefined,
    });

    res.json(result);
  },
);

// ─── Create issue ─────────────────────────────────────────────────────────────

const CreateIssueSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z
    .enum(["backlog", "todo", "in_progress", "in_review", "done", "blocked", "cancelled"])
    .optional(),
  priority: z.enum(["critical", "high", "medium", "low"]).optional(),
  projectId: z.string().uuid().optional(),
  goalId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  assigneeAgentId: z.string().uuid().optional(),
  assigneeUserId: z.string().uuid().optional(),
  billingCode: z.string().optional(),
});

router.post(
  "/companies/:companyId/issues",
  requireAuth,
  runIdHeader,
  async (req, res) => {
    const { companyId } = req.params;

    if (req.auth.companyId !== companyId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const parsed = CreateIssueSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const svc = new IssueService(getDb());
    const issue = await svc.create({
      companyId: companyId!,
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      priority: parsed.data.priority,
      projectId: parsed.data.projectId,
      goalId: parsed.data.goalId,
      parentId: parsed.data.parentId,
      assigneeAgentId: parsed.data.assigneeAgentId,
      assigneeUserId: parsed.data.assigneeUserId,
      billingCode: parsed.data.billingCode,
      createdByAgentId: req.auth.agentId,
      createdByUserId: req.auth.userId,
    });

    res.status(201).json(issue);
  },
);

// ─── Get issue ────────────────────────────────────────────────────────────────

router.get("/issues/:issueId", requireAuth, async (req, res) => {
  const svc = new IssueService(getDb());
  const issue = await svc.get(String(req.params["issueId"]));

  if (issue.companyId !== req.auth.companyId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  res.json(issue);
});

// ─── Checkout ─────────────────────────────────────────────────────────────────

const CheckoutSchema = z.object({
  agentId: z.string().uuid(),
  expectedStatuses: z
    .array(
      z.enum(["backlog", "todo", "in_progress", "in_review", "done", "blocked", "cancelled"]),
    )
    .optional(),
});

router.post(
  "/issues/:issueId/checkout",
  requireAuth,
  runIdHeader,
  async (req, res) => {
    const parsed = CheckoutSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const runId = req.auth.runId ?? req.headers["x-paperclip-run-id"] as string;
    if (!runId) {
      res.status(400).json({ error: "X-Paperclip-Run-Id header is required for checkout" });
      return;
    }

    const svc = new IssueService(getDb());
    const issue = await svc.checkout({
      issueId: String(req.params["issueId"]),
      agentId: parsed.data.agentId,
      runId,
      expectedStatuses: parsed.data.expectedStatuses,
    });

    res.json(issue);
  },
);

// ─── Update issue ─────────────────────────────────────────────────────────────

const UpdateIssueSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z
    .enum(["backlog", "todo", "in_progress", "in_review", "done", "blocked", "cancelled"])
    .optional(),
  priority: z.enum(["critical", "high", "medium", "low"]).optional(),
  projectId: z.string().uuid().nullable().optional(),
  goalId: z.string().uuid().nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
  assigneeAgentId: z.string().uuid().nullable().optional(),
  assigneeUserId: z.string().uuid().nullable().optional(),
  billingCode: z.string().nullable().optional(),
  comment: z.string().optional(),
});

router.patch(
  "/issues/:issueId",
  requireAuth,
  runIdHeader,
  async (req, res) => {
    const parsed = UpdateIssueSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { comment, ...fields } = parsed.data;

    const svc = new IssueService(getDb());
    const updated = await svc.update({
      issueId: String(req.params["issueId"]),
      companyId: req.auth.companyId,
      actorAgentId: req.auth.agentId,
      actorUserId: req.auth.userId,
      runId: req.auth.runId,
      fields: {
        title: fields.title,
        description: fields.description,
        status: fields.status,
        priority: fields.priority,
        assigneeAgentId: fields.assigneeAgentId,
        assigneeUserId: fields.assigneeUserId,
        projectId: fields.projectId,
        goalId: fields.goalId,
        parentId: fields.parentId,
        billingCode: fields.billingCode,
      },
      comment,
    });

    res.json(updated);
  },
);

// ─── Release ──────────────────────────────────────────────────────────────────

router.post(
  "/issues/:issueId/release",
  requireAuth,
  runIdHeader,
  async (req, res) => {
    const runId = req.auth.runId;
    if (!runId) {
      res.status(400).json({ error: "X-Paperclip-Run-Id header required" });
      return;
    }

    const svc = new IssueService(getDb());
    const released = await svc.release(String(req.params["issueId"]), runId);
    res.json(released);
  },
);

// ─── Comments ─────────────────────────────────────────────────────────────────

router.get("/issues/:issueId/comments", requireAuth, async (req, res) => {
  const svc = new IssueService(getDb());
  const comments = await svc.listComments(String(req.params["issueId"]));
  res.json(comments);
});

router.post(
  "/issues/:issueId/comments",
  requireAuth,
  runIdHeader,
  async (req, res) => {
    const schema = z.object({ body: z.string().min(1) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "body is required" });
      return;
    }

    const svc = new IssueService(getDb());
    const comment = await svc.addComment({
      issueId: String(req.params["issueId"]),
      authorAgentId: req.auth.agentId,
      authorUserId: req.auth.userId,
      runId: req.auth.runId,
      body: parsed.data.body,
    });

    res.status(201).json(comment);
  },
);

export default router;
