import { eq, and, gte, lte, desc } from "drizzle-orm";
import type { Db } from "../db/client.js";
import { auditLog } from "../db/schema.js";

export interface QueryAuditOptions {
  companyId: string;
  entityType?: string | undefined;
  entityId?: string | undefined;
  agentId?: string | undefined;
  userId?: string | undefined;
  runId?: string | undefined;
  action?: string | undefined;
  from?: Date | undefined;
  to?: Date | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

export class AuditService {
  constructor(private db: Db) {}

  async query(opts: QueryAuditOptions) {
    const conditions = [eq(auditLog.companyId, opts.companyId)];

    if (opts.entityType) conditions.push(eq(auditLog.entityType, opts.entityType));
    if (opts.entityId) conditions.push(eq(auditLog.entityId, opts.entityId));
    if (opts.agentId) conditions.push(eq(auditLog.agentId, opts.agentId));
    if (opts.userId) conditions.push(eq(auditLog.userId, opts.userId));
    if (opts.runId) conditions.push(eq(auditLog.runId, opts.runId));
    if (opts.action) conditions.push(eq(auditLog.action, opts.action));
    if (opts.from) conditions.push(gte(auditLog.createdAt, opts.from));
    if (opts.to) conditions.push(lte(auditLog.createdAt, opts.to));

    return this.db
      .select()
      .from(auditLog)
      .where(and(...conditions))
      .orderBy(desc(auditLog.createdAt))
      .limit(opts.limit ?? 100)
      .offset(opts.offset ?? 0);
  }
}
