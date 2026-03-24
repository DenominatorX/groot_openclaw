# DenominatorX Platform

Monorepo for DenominatorX.com — a secure, authenticated platform portal with sub-apps (Lumina, LuminaNexus) deployed on Cloudflare Pages + Workers.

## Structure

```
denominatorx-platform/
  apps/
    portal/       # React dashboard app (login + app launcher)
  worker/         # Cloudflare Worker — auth API
  d1/
    schema.sql    # D1 SQLite schema
  wrangler.toml   # Cloudflare config
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/): `npm install -g wrangler`
- Cloudflare account (free tier is fine)

---

## One-Time Setup

### 1. Authenticate Wrangler

```bash
wrangler login
```

### 2. Create D1 Database

```bash
wrangler d1 create denominatorx-db
```

Copy the `database_id` from the output and paste it into `wrangler.toml`:
```toml
[[d1_databases]]
database_id = "YOUR_DATABASE_ID_HERE"
```

Apply the schema:
```bash
wrangler d1 execute denominatorx-db --file=d1/schema.sql
```

### 3. Create KV Namespace

```bash
wrangler kv namespace create SESSIONS
wrangler kv namespace create SESSIONS --preview
```

Copy the `id` and `preview_id` into `wrangler.toml`:
```toml
[[kv_namespaces]]
id         = "YOUR_KV_ID"
preview_id = "YOUR_KV_PREVIEW_ID"
```

### 4. Set JWT Secret

```bash
wrangler secret put JWT_SECRET
# Enter a long random string (e.g. openssl rand -hex 32)
```

### 5. Install Dependencies

```bash
npm install
```

---

## Local Development

### Run the Worker locally

```bash
npm run dev:worker
# Worker API available at http://localhost:8787
```

### Run the Portal locally

```bash
npm run dev:portal
# Portal at http://localhost:5173 (proxies /api → localhost:8787)
```

---

## Deployment

### Deploy the Worker

```bash
npm run deploy:worker
# Deploys worker to: https://denominatorx-worker.<your-subdomain>.workers.dev
```

### Deploy the Portal to Cloudflare Pages

1. Build the portal:
   ```bash
   npm run build:portal
   ```

2. Deploy to Pages:
   ```bash
   wrangler pages deploy apps/portal/dist --project-name denominatorx-portal
   ```

3. Or connect the GitHub repo in the Cloudflare dashboard:
   - **Build command:** `npm run build:portal`
   - **Build output directory:** `apps/portal/dist`
   - **Root directory:** `/` (repo root)

### Connect Custom Domain

In Cloudflare Dashboard → Pages → denominatorx-portal → Custom Domains:
- Add `denominatorx.com` and `www.denominatorx.com`
- Cloudflare will handle SSL automatically

---

## Environment Variables Reference

| Variable | Where | Description |
|----------|-------|-------------|
| `JWT_SECRET` | Worker secret | Random string for JWT signing |
| `DB` | wrangler.toml | D1 database binding |
| `SESSIONS` | wrangler.toml | KV namespace binding |

---

## Auth API

All endpoints served by the Cloudflare Worker at `/api/auth/*`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | — | Create account |
| `POST` | `/api/auth/login` | — | Sign in, get JWT |
| `GET` | `/api/auth/me` | Bearer token | Validate session, get user |
| `POST` | `/api/auth/logout` | Bearer token | Revoke token |
| `GET` | `/api/health` | — | Health check |

**Register / Login request body:**
```json
{ "email": "you@example.com", "password": "••••••••" }
```

**Response:**
```json
{
  "token": "<jwt>",
  "user": { "id": "...", "email": "...", "subscription_tier": "free" }
}
```

---

## Adding Sub-Apps

The portal links to `/lumina` and `/nexus`. To serve them from the same Pages project:

1. Build each app with its base path set in `vite.config.js`:
   ```js
   // lumina-app/vite.config.js
   export default defineConfig({ base: '/lumina/' })
   ```

2. Copy built output into the portal's `dist` folder:
   ```
   dist/
     index.html       # portal
     lumina/          # Lumina app
     nexus/           # LuminaNexus app
   ```

3. Or use separate Pages projects and configure custom domains/subdirectories.

---

## PWA

The portal ships a `manifest.json` — users can add it to their home screen on iOS/Android via Safari/Chrome → "Add to Home Screen".
