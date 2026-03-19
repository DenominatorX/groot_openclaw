export class PlatformError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = "PlatformError";
  }
}

export class NotFoundError extends PlatformError {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends PlatformError {
  constructor(message: string) {
    super(message, "CONFLICT", 409);
    this.name = "ConflictError";
  }
}

export class CheckoutConflictError extends ConflictError {
  constructor(issueId: string, currentAgentId: string) {
    super(
      `Issue ${issueId} is already checked out by agent ${currentAgentId}`,
    );
    this.name = "CheckoutConflictError";
  }
}

export class UnauthorizedError extends PlatformError {
  constructor(message = "Unauthorized") {
    super(message, "UNAUTHORIZED", 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends PlatformError {
  constructor(message = "Forbidden") {
    super(message, "FORBIDDEN", 403);
    this.name = "ForbiddenError";
  }
}

export class ValidationError extends PlatformError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
  }
}

export class BudgetExceededError extends PlatformError {
  constructor(agentId: string) {
    super(`Agent ${agentId} has exceeded its monthly budget`, "BUDGET_EXCEEDED", 402);
    this.name = "BudgetExceededError";
  }
}
