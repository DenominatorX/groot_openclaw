# Architecture — Agentic Project Management Platform

## Vision

An infrastructure layer that lets AI agents autonomously manage software projects: picking up tasks, checking out work, executing via LLM adapters, posting results, and escalating through governance workflows — all with ethical safeguards and audit trails.

---

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Board / Users                        │
└──────────────────────────┬──────────────────────────────┘
                           │ REST API
┌──────────────────────────▼──────────────────────────────┐
│                   API Gateway (packages/api)             │
│   Auth · Rate-limiting · Run-ID tracing · Webhooks      │
└─────┬──────────────┬──────────────┬─────────────────────┘
      │              │              │
┌─────▼─────┐  ┌─────▼──────┐  ┌───▼──────────┐
│  Issue    │  │  Agent     │  │  Governance  │
│  Service  │  │  Service   │  │  Service     │
│           │  │            │  │  (packages/  │
│ CRUD,     │  │ heartbeat, │  │  governance) │
│ checkout, │  │ runs,      │  │              │
│ lifecycle │  │ scheduling │  │ approvals,   │
└─────┬─────┘  └─────┬──────┘  │ audit,       │
      │              │          │ budget       │
┌─────▼──────────────▼──────────▼──────────────┐
│                PostgreSQL                      │
│   companies · agents · issues · runs ·        │
│   comments · approvals · audit_log            │
└───────────────────────────────────────────────┘

┌───────────────────────────────────────────────┐
│          Agent Runtime (packages/agent-runtime)│
│                                               │
│  Scheduler → HeartbeatExecutor → Adapter      │
│                                               │
│  Adapters: claude_local, codex_local, ...     │
└───────────────────────────────────────────────┘
```

---

## Package Structure

```
packages/
├── core/            # Shared types, models, errors (no runtime deps)
├── api/             # Express REST API server
├── agent-runtime/   # Heartbeat scheduler + adapter runner
└── governance/      # Approval workflows, audit log, budget enforcement
```

### `@agentic/core`
Zero-dependency package. Contains:
- TypeScript types and branded IDs
- Data model interfaces (Agent, Issue, Project, Approval, etc.)
- Domain errors (NotFoundError, ConflictError, BudgetExceededError, etc.)

### `@agentic/api`
REST API surface. Key routes:
- `GET/POST /api/companies/:id/issues` — list, create
- `POST /api/issues/:id/checkout` — atomic checkout (prevents double-assignment)
- `PATCH /api/issues/:id` — status/field updates, inline comment
- `POST /api/issues/:id/comments` — add comment
- `GET/POST /api/companies/:id/agents` — agent management
- `POST /api/approvals` — request approval
- `GET /api/agents/me` — identity resolution from JWT

### `@agentic/agent-runtime`
Runs outside the API process. Responsibilities:
- Poll/schedule heartbeats for each enabled agent
- Inject `PAPERCLIP_*` env vars and invoke adapter subprocess
- Track run lifecycle (queued → running → completed/failed)
- Wake-on-demand via event bus when new tasks are assigned

### `@agentic/governance`
Enforces company policy at runtime:
- Approval gates for privileged actions (agent creation, budget increases)
- Immutable audit log (append-only) for all state mutations
- Budget enforcement: tracks `spentMonthlyCents` per agent, pauses at threshold
- Escalation chains derived from `chainOfCommand`

---

## Data Model

### Core entities

| Entity | Key fields | Notes |
|--------|-----------|-------|
| `Company` | id, name | Tenant root |
| `Agent` | id, companyId, role, reportsTo, adapterType, budgetMonthlyCents | AI or human |
| `Issue` | id, status, assigneeAgentId, checkoutRunId | Concurrency via checkout lock |
| `AgentRun` | id, agentId, status, invocationSource | Heartbeat execution record |
| `Project` | id, workspaces[] | Workspace = local dir + optional git repo |
| `Goal` | id, level, status | Hierarchical objectives |
| `Approval` | id, status, linkedIssues[] | Governance gate |
| `AuditLog` | id, entityType, entityId, action, agentId | Append-only |

### Checkout protocol
Checkout is an atomic compare-and-swap:
1. Verify `status IN expectedStatuses`
2. Verify `checkoutRunId IS NULL` or owned by same run
3. Set `status = in_progress`, `checkoutRunId = runId`, `startedAt`
4. Any concurrent attempt returns `409 Conflict`

This prevents two agents from working the same issue simultaneously.

---

## Key Design Decisions

### 1. Stateless agents, stateful platform
Agents do not hold state between heartbeats. All state lives in the platform DB. This makes agents interchangeable and failure-safe.

### 2. Run-ID tracing
Every mutating API call must include `X-Paperclip-Run-Id`. This links every change to an auditable heartbeat run, enabling full replay and forensic analysis.

### 3. Chain of command for escalation
Agents have a `reportsTo` hierarchy. When blocked, an agent escalates to its manager. The platform enforces this — cross-team delegation requires `billingCode`.

### 4. Budget as a first-class primitive
Monthly spend is tracked per agent in cents. The platform auto-pauses agents at 100% budget. Above 80%, only critical tasks execute.

### 5. Approval gates before irreversible actions
Actions with high blast radius (create agents, push to prod, delete data) must go through an approval workflow. Approvals are linked to issues so board users have full context.

### 6. Adapter abstraction
Agents are model-agnostic. An adapter is a subprocess contract: receive env vars, do work, exit. `claude_local` spawns `claude` CLI; `codex_local` spawns `codex`. New adapters are additive.

---

## Deployment

### Local development
```bash
npm install
npm run dev         # starts API + agent runtime in watch mode
```

### Environment variables
```
DATABASE_URL          PostgreSQL connection string
JWT_SECRET            API auth signing key
AGENT_POLL_INTERVAL   Heartbeat scheduler interval (seconds)
LOG_LEVEL             debug | info | warn | error
```

### CI/CD
GitHub Actions runs on every PR:
1. `npm run lint` — TypeScript strict mode
2. `npm run build` — compile all packages
3. `npm run test` — unit + integration tests
4. Deploy to staging on merge to `main`

---

## Security Model

- All API requests authenticated via JWT (`Authorization: Bearer`)
- Agents receive short-lived run JWTs, scoped to a single run
- Board users have persistent JWTs with role-based permissions
- No agent can access another company's data (row-level tenant isolation)
- Audit log is append-only; no DELETE endpoint exists for audit records
- Sensitive env vars (API keys, DB credentials) never logged

---

## Roadmap (Phases)

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Foundation: repo, models, architecture | ✅ Done |
| 2 | MVP: task lifecycle, assignment, heartbeat | 🔜 Next |
| 3 | Governance: approvals, audit, budget | Planned |
| 4 | Scale: multi-project, integrations, dashboards | Planned |
