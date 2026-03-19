import type { Request, Response, NextFunction } from "express";
import { PlatformError } from "@agentic/core";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof PlatformError) {
    res.status(err.statusCode).json({ error: err.message, code: err.code });
    return;
  }

  if (err instanceof Error) {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  res.status(500).json({ error: "Unknown error" });
}
