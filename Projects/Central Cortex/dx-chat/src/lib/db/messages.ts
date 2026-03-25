import { getDb, persistDb, scheduleDbSave } from './index';
import { encrypt, decrypt } from './encryption';
import type { Message } from '../ai/types';

export interface DbThread {
  id: string;
  agentId: string;
  title: string;
  createdAt: number;
  archived: boolean;
}

export interface DbMessage {
  id: string;
  threadId: string;
  role: string;
  content: string;
  toolCalls?: any[];
  toolCallId?: string;
  createdAt: number;
}

export const PAGE_SIZE = 50;

// ─── Threads ────────────────────────────────────────────────────────────────

export async function createThread(
  thread: Pick<DbThread, 'id' | 'agentId' | 'title'>,
): Promise<void> {
  const db = await getDb();
  db.run(
    'INSERT OR IGNORE INTO threads (id, agent_id, title, created_at) VALUES (?, ?, ?, ?)',
    [thread.id, thread.agentId, thread.title, Date.now()],
  );
  await persistDb();
}

export async function getAllThreads(): Promise<DbThread[]> {
  const db = await getDb();
  const stmt = db.prepare(
    'SELECT id, agent_id, title, created_at FROM threads WHERE archived = 0 ORDER BY created_at DESC',
  );
  const threads: DbThread[] = [];
  while (stmt.step()) {
    const r = stmt.getAsObject() as Record<string, unknown>;
    threads.push({
      id: r.id as string,
      agentId: r.agent_id as string,
      title: r.title as string,
      createdAt: r.created_at as number,
      archived: false,
    });
  }
  stmt.free();
  return threads;
}

export async function archiveThread(threadId: string): Promise<void> {
  const db = await getDb();
  db.run('UPDATE threads SET archived = 1 WHERE id = ?', [threadId]);
  db.run('UPDATE messages SET archived = 1 WHERE thread_id = ?', [threadId]);
  await persistDb();
}

// ─── Messages ───────────────────────────────────────────────────────────────

export async function addMessage(
  threadId: string,
  message: Message & { id: string },
): Promise<void> {
  const db = await getDb();
  const plain =
    typeof message.content === 'string' ? message.content : JSON.stringify(message.content);
  const enc = await encrypt(plain);

  db.run(
    `INSERT OR IGNORE INTO messages
       (id, thread_id, role, content_enc, content_plain, tool_calls, tool_call_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      message.id,
      threadId,
      message.role,
      enc,
      plain,
      message.tool_calls ? JSON.stringify(message.tool_calls) : null,
      message.tool_call_id ?? null,
      Date.now(),
    ],
  );
  scheduleDbSave();
}

/** Update the content of the most recent assistant message in a thread (post-stream). */
export async function persistLastAssistantMessage(
  threadId: string,
  content: string,
): Promise<void> {
  const db = await getDb();
  const enc = await encrypt(content);
  db.run(
    `UPDATE messages
     SET content_enc = ?, content_plain = ?
     WHERE rowid = (
       SELECT rowid FROM messages
       WHERE thread_id = ? AND role = 'assistant' AND archived = 0
       ORDER BY created_at DESC LIMIT 1
     )`,
    [enc, content, threadId],
  );
  await persistDb();
}

export async function getThreadMessages(
  threadId: string,
  page = 0,
): Promise<DbMessage[]> {
  const db = await getDb();
  const stmt = db.prepare(
    `SELECT id, thread_id, role, content_enc, tool_calls, tool_call_id, created_at
     FROM messages
     WHERE thread_id = ? AND archived = 0
     ORDER BY created_at ASC
     LIMIT ? OFFSET ?`,
  );
  stmt.bind([threadId, PAGE_SIZE, page * PAGE_SIZE]);

  const msgs: DbMessage[] = [];
  while (stmt.step()) {
    const r = stmt.getAsObject() as Record<string, unknown>;
    const content = await decrypt(r.content_enc as string);
    msgs.push({
      id: r.id as string,
      threadId: r.thread_id as string,
      role: r.role as string,
      content,
      toolCalls: r.tool_calls ? JSON.parse(r.tool_calls as string) : undefined,
      toolCallId: (r.tool_call_id as string) ?? undefined,
      createdAt: r.created_at as number,
    });
  }
  stmt.free();
  return msgs;
}

export interface SearchResult extends DbMessage {
  threadTitle: string;
  agentId: string;
}

export async function searchMessages(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const db = await getDb();
  const stmt = db.prepare(
    `SELECT m.id, m.thread_id, m.role, m.content_enc, m.created_at,
            t.title AS thread_title, t.agent_id
     FROM messages_fts f
     JOIN messages m ON m.rowid = f.rowid
     JOIN threads  t ON t.id    = m.thread_id
     WHERE messages_fts MATCH ?
       AND m.archived = 0
     ORDER BY rank
     LIMIT 100`,
  );
  stmt.bind([query]);

  const results: SearchResult[] = [];
  while (stmt.step()) {
    const r = stmt.getAsObject() as Record<string, unknown>;
    const content = await decrypt(r.content_enc as string);
    results.push({
      id: r.id as string,
      threadId: r.thread_id as string,
      role: r.role as string,
      content,
      createdAt: r.created_at as number,
      threadTitle: r.thread_title as string,
      agentId: r.agent_id as string,
    });
  }
  stmt.free();
  return results;
}

// ─── Export ──────────────────────────────────────────────────────────────────

export async function exportThread(
  threadId: string,
  format: 'json' | 'markdown',
): Promise<string> {
  const db = await getDb();

  const tStmt = db.prepare(
    'SELECT id, agent_id, title, created_at FROM threads WHERE id = ?',
  );
  tStmt.bind([threadId]);
  if (!tStmt.step()) {
    tStmt.free();
    throw new Error('Thread not found');
  }
  const t = tStmt.getAsObject() as Record<string, unknown>;
  tStmt.free();

  const mStmt = db.prepare(
    `SELECT role, content_enc, created_at
     FROM messages WHERE thread_id = ? AND archived = 0
     ORDER BY created_at ASC`,
  );
  mStmt.bind([threadId]);

  const messages: Array<{ role: string; content: string; createdAt: number }> = [];
  while (mStmt.step()) {
    const r = mStmt.getAsObject() as Record<string, unknown>;
    messages.push({
      role: r.role as string,
      content: await decrypt(r.content_enc as string),
      createdAt: r.created_at as number,
    });
  }
  mStmt.free();

  if (format === 'json') {
    return JSON.stringify(
      { thread: { id: t.id, title: t.title, agentId: t.agent_id }, messages },
      null,
      2,
    );
  }

  // Markdown
  const lines = [
    `# ${t.title}`,
    `*Agent: ${t.agent_id} — Exported ${new Date().toLocaleString()}*`,
    '',
  ];
  for (const m of messages) {
    const ts = new Date(m.createdAt).toLocaleTimeString();
    const speaker = m.role === 'user' ? '**You**' : `**Assistant**`;
    lines.push(`${speaker} *(${ts})*`, '', m.content, '');
  }
  return lines.join('\n');
}
