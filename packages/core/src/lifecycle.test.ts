/**
 * End-to-end task lifecycle tests.
 *
 * These tests verify the full state machine for issues:
 *   create → assign → checkout → work → done
 *
 * They run entirely in-memory using the model types and error classes —
 * no database or API server required. The checkout conflict logic is
 * tested via the domain error contracts.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  NotFoundError,
  ConflictError,
  asAgentId,
  asCompanyId,
  asIssueId,
  asRunId,
} from "./index.js";
import type { Issue, IssueStatus } from "./index.js";

// ─── Minimal in-memory issue store ───────────────────────────────────────────

class InMemoryIssueStore {
  private store = new Map<string, Issue>();
  private counter = 0;

  create(input: { title: string; companyId: string }): Issue {
    const id = asIssueId(`iss-${++this.counter}`);
    const issue: Issue = {
      id,
      companyId: asCompanyId(input.companyId),
      projectId: null,
      goalId: null,
      parentId: null,
      title: input.title,
      description: null,
      status: "todo",
      priority: "medium",
      assigneeAgentId: null,
      assigneeUserId: null,
      checkoutRunId: null,
      executionRunId: null,
      executionAgentNameKey: null,
      executionLockedAt: null,
      requestDepth: 0,
      billingCode: null,
      issueNumber: this.counter,
      identifier: `TEST-${this.counter}`,
      createdByAgentId: null,
      createdByUserId: null,
      startedAt: null,
      completedAt: null,
      cancelledAt: null,
      hiddenAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.store.set(id, issue);
    return issue;
  }

  get(id: string): Issue {
    const issue = this.store.get(id);
    if (!issue) throw new NotFoundError("Issue", id);
    return issue;
  }

  assign(id: string, agentId: string): Issue {
    const issue = this.get(id);
    const updated = { ...issue, assigneeAgentId: asAgentId(agentId) };
    this.store.set(id, updated);
    return updated;
  }

  checkout(id: string, runId: string, expectedStatuses: IssueStatus[] = ["todo", "backlog", "blocked"]): Issue {
    const issue = this.get(id);

    // Idempotent if same run
    if (issue.checkoutRunId === runId) return issue;

    // Conflict if already checked out by another run
    if (issue.checkoutRunId && issue.status === "in_progress") {
      throw new ConflictError(`Issue ${id} checked out by run ${issue.checkoutRunId}`);
    }

    if (!expectedStatuses.includes(issue.status as IssueStatus)) {
      throw new ConflictError(`Issue ${id} has status '${issue.status}'`);
    }

    const updated: Issue = {
      ...issue,
      status: "in_progress",
      checkoutRunId: asRunId(runId),
      executionRunId: asRunId(runId),
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.store.set(id, updated);
    return updated;
  }

  updateStatus(id: string, status: IssueStatus): Issue {
    const issue = this.get(id);
    const updated: Issue = {
      ...issue,
      status,
      checkoutRunId: status === "done" || status === "cancelled" ? null : issue.checkoutRunId,
      completedAt: status === "done" ? new Date().toISOString() : issue.completedAt,
      updatedAt: new Date().toISOString(),
    };
    this.store.set(id, updated);
    return updated;
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Task lifecycle", () => {
  it("full happy path: create → assign → checkout → done", () => {
    const store = new InMemoryIssueStore();

    // 1. Create
    const issue = store.create({ title: "Build auth API", companyId: "co-1" });
    assert.equal(issue.status, "todo");
    assert.equal(issue.checkoutRunId, null);
    assert.equal(issue.identifier, "TEST-1");

    // 2. Assign
    const assigned = store.assign(issue.id, "agent-1");
    assert.equal(assigned.assigneeAgentId, "agent-1");

    // 3. Checkout
    const checked = store.checkout(issue.id, "run-abc");
    assert.equal(checked.status, "in_progress");
    assert.equal(checked.checkoutRunId, "run-abc");
    assert.ok(checked.startedAt !== null);

    // 4. Done
    const done = store.updateStatus(issue.id, "done");
    assert.equal(done.status, "done");
    assert.equal(done.checkoutRunId, null); // lock released
    assert.ok(done.completedAt !== null);
  });

  it("checkout is idempotent for the same run", () => {
    const store = new InMemoryIssueStore();
    const issue = store.create({ title: "Idempotent test", companyId: "co-1" });

    const first = store.checkout(issue.id, "run-1");
    const second = store.checkout(issue.id, "run-1"); // same run
    assert.equal(first.checkoutRunId, second.checkoutRunId);
    assert.equal(second.status, "in_progress");
  });

  it("checkout conflicts when a different run holds the lock", () => {
    const store = new InMemoryIssueStore();
    const issue = store.create({ title: "Conflict test", companyId: "co-1" });

    store.checkout(issue.id, "run-A");

    assert.throws(
      () => store.checkout(issue.id, "run-B"),
      (err) => {
        assert.ok(err instanceof ConflictError);
        assert.equal(err.statusCode, 409);
        return true;
      },
    );
  });

  it("checkout rejects unexpected status", () => {
    const store = new InMemoryIssueStore();
    const issue = store.create({ title: "Done issue", companyId: "co-1" });
    store.updateStatus(issue.id, "done");

    assert.throws(
      () => store.checkout(issue.id, "run-X", ["todo", "backlog"]),
      (err) => {
        assert.ok(err instanceof ConflictError);
        assert.match(err.message, /done/);
        return true;
      },
    );
  });

  it("blocked → checkout → done is valid", () => {
    const store = new InMemoryIssueStore();
    const issue = store.create({ title: "Unblocking work", companyId: "co-1" });
    store.updateStatus(issue.id, "blocked");

    const checked = store.checkout(issue.id, "run-unblock", [
      "todo",
      "backlog",
      "blocked",
    ]);
    assert.equal(checked.status, "in_progress");

    const done = store.updateStatus(issue.id, "done");
    assert.equal(done.status, "done");
  });

  it("NotFoundError thrown for missing issue", () => {
    const store = new InMemoryIssueStore();

    assert.throws(
      () => store.get("nonexistent"),
      (err) => {
        assert.ok(err instanceof NotFoundError);
        assert.equal(err.statusCode, 404);
        assert.match(err.message, /nonexistent/);
        return true;
      },
    );
  });

  it("multiple agents can have different issues checked out simultaneously", () => {
    const store = new InMemoryIssueStore();

    const issue1 = store.create({ title: "Task A", companyId: "co-1" });
    const issue2 = store.create({ title: "Task B", companyId: "co-1" });

    store.assign(issue1.id, "agent-1");
    store.assign(issue2.id, "agent-2");

    const c1 = store.checkout(issue1.id, "run-agent1");
    const c2 = store.checkout(issue2.id, "run-agent2");

    assert.equal(c1.checkoutRunId, "run-agent1");
    assert.equal(c2.checkoutRunId, "run-agent2");
  });
});
