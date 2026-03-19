import { eq } from "drizzle-orm";
import type { Db } from "../db/client.js";
import { companyWebhooks } from "../db/schema.js";

export type WebhookEvent =
  | "issue.created"
  | "issue.updated"
  | "issue.status_changed"
  | "issue.assigned"
  | "issue.commented"
  | "approval.created"
  | "approval.resolved";

export interface WebhookPayload {
  event: WebhookEvent;
  companyId: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export class WebhookService {
  constructor(private db: Db) {}

  async listForCompany(companyId: string) {
    return this.db
      .select()
      .from(companyWebhooks)
      .where(eq(companyWebhooks.companyId, companyId));
  }

  async create(companyId: string, url: string, events: WebhookEvent[], secret?: string) {
    const { randomUUID } = await import("node:crypto");
    const id = randomUUID();

    const [hook] = await this.db
      .insert(companyWebhooks)
      .values({ id, companyId, url, events: events as string[], secret: secret ?? null })
      .returning();

    return hook!;
  }

  async delete(webhookId: string, companyId: string) {
    await this.db
      .delete(companyWebhooks)
      .where(eq(companyWebhooks.id, webhookId));
  }

  /**
   * Fire a webhook event to all registered listeners for this company.
   * Best-effort: errors are logged but do not fail the caller.
   */
  async dispatch(companyId: string, event: WebhookEvent, data: Record<string, unknown>) {
    const hooks = await this.db
      .select()
      .from(companyWebhooks)
      .where(eq(companyWebhooks.companyId, companyId));

    const payload: WebhookPayload = {
      event,
      companyId,
      timestamp: new Date().toISOString(),
      data,
    };

    await Promise.allSettled(
      hooks
        .filter((h) => h.enabled && (h.events as string[]).includes(event))
        .map((h) => this._send(h.url, payload, h.secret ?? undefined)),
    );
  }

  private async _send(url: string, payload: WebhookPayload, secret?: string) {
    const body = JSON.stringify(payload);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "Agentic-Platform/1.0",
    };

    if (secret) {
      const { createHmac } = await import("node:crypto");
      const sig = createHmac("sha256", secret).update(body).digest("hex");
      headers["X-Agentic-Signature"] = `sha256=${sig}`;
    }

    const resp = await fetch(url, { method: "POST", headers, body, signal: AbortSignal.timeout(5000) });

    if (!resp.ok) {
      console.warn(`[webhook] ${url} returned ${resp.status} for event ${payload.event}`);
    }
  }
}
