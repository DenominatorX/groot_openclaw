import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  asAgentId,
  asCompanyId,
  asIssueId,
  asProjectId,
  asGoalId,
  asRunId,
} from "./index.js";

describe("Branded ID helpers", () => {
  it("asAgentId returns the string value", () => {
    const id = asAgentId("abc-123");
    assert.equal(id, "abc-123");
  });

  it("asCompanyId returns the string value", () => {
    assert.equal(asCompanyId("co-1"), "co-1");
  });

  it("asIssueId returns the string value", () => {
    assert.equal(asIssueId("iss-99"), "iss-99");
  });

  it("asProjectId, asGoalId, asRunId all pass through", () => {
    assert.equal(asProjectId("proj-1"), "proj-1");
    assert.equal(asGoalId("goal-1"), "goal-1");
    assert.equal(asRunId("run-1"), "run-1");
  });
});
