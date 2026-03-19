import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Issue, CreateIssueInput, UpdateIssueInput } from "./issue.js";
import type { IssueStatus } from "../types/index.js";

// ─── Type-level tests (compile-time checks) ───────────────────────────────────
// These verify the type contracts are correct. If they fail to compile,
// the models are broken.

describe("Issue model", () => {
  it("accepts a valid full Issue object", () => {
    const issue: Issue = {
      id: "iss-1" as import("../types/index.js").IssueId,
      companyId: "co-1" as import("../types/index.js").CompanyId,
      projectId: null,
      goalId: null,
      parentId: null,
      title: "Fix auth bug",
      description: null,
      status: "todo",
      priority: "high",
      assigneeAgentId: null,
      assigneeUserId: null,
      checkoutRunId: null,
      executionRunId: null,
      executionAgentNameKey: null,
      executionLockedAt: null,
      requestDepth: 0,
      billingCode: null,
      issueNumber: 1,
      identifier: "PROJ-1",
      createdByAgentId: null,
      createdByUserId: null,
      startedAt: null,
      completedAt: null,
      cancelledAt: null,
      hiddenAt: null,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };

    assert.equal(issue.status, "todo");
    assert.equal(issue.identifier, "PROJ-1");
  });

  it("validates all issue status values", () => {
    const validStatuses: IssueStatus[] = [
      "backlog",
      "todo",
      "in_progress",
      "in_review",
      "done",
      "blocked",
      "cancelled",
    ];
    assert.equal(validStatuses.length, 7);
  });

  it("CreateIssueInput requires only title", () => {
    const minimal: CreateIssueInput = { title: "Minimal issue" };
    assert.equal(minimal.title, "Minimal issue");
    assert.equal(minimal.status, undefined);
  });

  it("UpdateIssueInput allows clearing assignee", () => {
    const update: UpdateIssueInput = {
      assigneeAgentId: null,
      assigneeUserId: null,
      status: "in_review",
    };
    assert.equal(update.assigneeAgentId, null);
    assert.equal(update.status, "in_review");
  });
});
