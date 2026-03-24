-- DenominatorX D1 Schema
-- Apply with: wrangler d1 execute denominatorx-db --file=d1/schema.sql

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id                TEXT PRIMARY KEY,
  email             TEXT UNIQUE NOT NULL,
  password_hash     TEXT NOT NULL,
  created_at        TEXT NOT NULL,
  subscription_tier TEXT NOT NULL DEFAULT 'free'
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
