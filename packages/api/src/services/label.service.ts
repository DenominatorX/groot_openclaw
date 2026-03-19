import { eq, and, inArray } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import type { Db } from "../db/client.js";
import { labels, issueLabels } from "../db/schema.js";
import { NotFoundError } from "@agentic/core";

export class LabelService {
  constructor(private db: Db) {}

  async list(companyId: string) {
    return this.db
      .select()
      .from(labels)
      .where(eq(labels.companyId, companyId))
      .orderBy(labels.name);
  }

  async create(companyId: string, name: string, color?: string) {
    const id = randomUUID();

    const [label] = await this.db
      .insert(labels)
      .values({ id, companyId, name: name.trim(), color: color ?? "#6366f1" })
      .returning();

    return label!;
  }

  async delete(labelId: string, companyId: string) {
    const [existing] = await this.db
      .select()
      .from(labels)
      .where(and(eq(labels.id, labelId), eq(labels.companyId, companyId)))
      .limit(1);

    if (!existing) throw new NotFoundError("Label", labelId);

    await this.db.delete(labels).where(eq(labels.id, labelId));
  }

  async setIssueLabels(issueId: string, labelIds: string[]) {
    // Remove existing
    await this.db.delete(issueLabels).where(eq(issueLabels.issueId, issueId));

    if (labelIds.length > 0) {
      await this.db.insert(issueLabels).values(
        labelIds.map((labelId) => ({ issueId, labelId })),
      );
    }
  }

  async getForIssues(issueIds: string[]) {
    if (issueIds.length === 0) return [];

    const rows = await this.db
      .select({ issueId: issueLabels.issueId, label: labels })
      .from(issueLabels)
      .innerJoin(labels, eq(issueLabels.labelId, labels.id))
      .where(inArray(issueLabels.issueId, issueIds));

    return rows;
  }
}
