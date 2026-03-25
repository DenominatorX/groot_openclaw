import type { Database, SqlJsStatic } from 'sql.js';
import { get, set } from 'idb-keyval';

const DB_STORE_KEY = 'dx-chat-db';

let db: Database | null = null;
let pendingSave: ReturnType<typeof setTimeout> | null = null;

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS threads (
    id         TEXT    PRIMARY KEY,
    agent_id   TEXT    NOT NULL,
    title      TEXT    NOT NULL,
    created_at INTEGER NOT NULL,
    archived   INTEGER NOT NULL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_threads_agent ON threads(agent_id, created_at);

  CREATE TABLE IF NOT EXISTS messages (
    id            TEXT    PRIMARY KEY,
    thread_id     TEXT    NOT NULL REFERENCES threads(id),
    role          TEXT    NOT NULL CHECK(role IN ('user','assistant','system','tool')),
    content_enc   TEXT    NOT NULL,
    content_plain TEXT    NOT NULL,
    tool_calls    TEXT,
    tool_call_id  TEXT,
    created_at    INTEGER NOT NULL,
    archived      INTEGER NOT NULL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id, created_at);

  CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(
    thread_id UNINDEXED,
    content,
    content='messages',
    content_rowid='rowid'
  );

  CREATE TRIGGER IF NOT EXISTS messages_ai AFTER INSERT ON messages BEGIN
    INSERT INTO messages_fts(rowid, thread_id, content)
      VALUES (new.rowid, new.thread_id, new.content_plain);
  END;

  CREATE TRIGGER IF NOT EXISTS messages_ad AFTER DELETE ON messages BEGIN
    INSERT INTO messages_fts(messages_fts, rowid, thread_id, content)
      VALUES ('delete', old.rowid, old.thread_id, old.content_plain);
  END;

  CREATE TRIGGER IF NOT EXISTS messages_au AFTER UPDATE OF content_plain ON messages BEGIN
    INSERT INTO messages_fts(messages_fts, rowid, thread_id, content)
      VALUES ('delete', old.rowid, old.thread_id, old.content_plain);
    INSERT INTO messages_fts(rowid, thread_id, content)
      VALUES (new.rowid, new.thread_id, new.content_plain);
  END;
`;

export async function getDb(): Promise<Database> {
  if (db) return db;

  const initSqlJs = (await import('sql.js')).default;
  // Use CDN-hosted WASM to avoid bundler complexity
  const SQL: SqlJsStatic = await initSqlJs({
    locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.14.0/${file}`,
  });

  const stored = await get<ArrayBuffer>(DB_STORE_KEY);
  db = stored ? new SQL.Database(new Uint8Array(stored)) : new SQL.Database();
  db.run(SCHEMA);
  return db;
}

/** Debounced persist — batches rapid writes into one IndexedDB save. */
export function scheduleDbSave(): void {
  if (pendingSave) clearTimeout(pendingSave);
  pendingSave = setTimeout(async () => {
    if (!db) return;
    const data = db.export();
    await set(DB_STORE_KEY, data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
  }, 200);
}

/** Force an immediate DB save (call after critical writes). */
export async function persistDb(): Promise<void> {
  if (pendingSave) {
    clearTimeout(pendingSave);
    pendingSave = null;
  }
  if (!db) return;
  const data = db.export();
  await set(DB_STORE_KEY, data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
}
