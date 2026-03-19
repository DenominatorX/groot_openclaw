import type { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";
import { UnauthorizedError } from "@agentic/core";

export interface AuthContext {
  agentId?: string;
  userId?: string;
  companyId: string;
  runId?: string;
}

declare global {
  namespace Express {
    interface Request {
      auth: AuthContext;
    }
  }
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers["authorization"];
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing authorization header" });
    return;
  }

  const token = header.slice(7);
  const secret = process.env["JWT_SECRET"];
  if (!secret) {
    res.status(500).json({ error: "JWT_SECRET not configured" });
    return;
  }

  const encoder = new TextEncoder();
  jwtVerify(token, encoder.encode(secret))
    .then(({ payload }) => {
      req.auth = {
        agentId: payload["agentId"] as string | undefined,
        userId: payload["userId"] as string | undefined,
        companyId: payload["companyId"] as string,
        runId: payload["runId"] as string | undefined,
      };

      if (!req.auth.companyId) {
        res.status(401).json({ error: "Token missing companyId claim" });
        return;
      }

      next();
    })
    .catch(() => {
      res.status(401).json({ error: "Invalid or expired token" });
    });
}

export function runIdHeader(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const runId = req.headers["x-paperclip-run-id"] as string | undefined;
  if (runId && req.auth) {
    req.auth.runId = runId;
  }
  next();
}
