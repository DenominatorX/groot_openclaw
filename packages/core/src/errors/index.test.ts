import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  NotFoundError,
  ConflictError,
  CheckoutConflictError,
  UnauthorizedError,
  ValidationError,
  BudgetExceededError,
} from "./index.js";

describe("Domain errors", () => {
  it("NotFoundError has correct code and status", () => {
    const err = new NotFoundError("Issue", "iss-123");
    assert.equal(err.code, "NOT_FOUND");
    assert.equal(err.statusCode, 404);
    assert.match(err.message, /iss-123/);
    assert.ok(err instanceof Error);
  });

  it("ConflictError has 409 status", () => {
    const err = new ConflictError("already exists");
    assert.equal(err.statusCode, 409);
    assert.equal(err.code, "CONFLICT");
  });

  it("CheckoutConflictError surfaces agent and issue", () => {
    const err = new CheckoutConflictError("iss-1", "agent-42");
    assert.equal(err.statusCode, 409);
    assert.match(err.message, /iss-1/);
    assert.match(err.message, /agent-42/);
  });

  it("UnauthorizedError defaults to 401", () => {
    const err = new UnauthorizedError();
    assert.equal(err.statusCode, 401);
    assert.equal(err.code, "UNAUTHORIZED");
  });

  it("ValidationError has 400 status", () => {
    const err = new ValidationError("title is required");
    assert.equal(err.statusCode, 400);
    assert.match(err.message, /title/);
  });

  it("BudgetExceededError has 402 status", () => {
    const err = new BudgetExceededError("agent-1");
    assert.equal(err.statusCode, 402);
    assert.equal(err.code, "BUDGET_EXCEEDED");
  });
});
