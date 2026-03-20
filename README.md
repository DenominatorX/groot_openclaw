# Agentic Project Management Platform

Efficient, ethical, and legal automation of project and program development and agentic project management lifecycle.

## What this is

An infrastructure layer for AI agents to autonomously manage software projects: picking up tasks, executing via LLM adapters, posting results, and escalating through governance workflows — with audit trails and ethical safeguards built in.

## Packages

| Package | Description |
|---------|-------------|
| `@agentic/core` | Types, data models, domain errors |
| `@agentic/api` | REST API server |
| `@agentic/agent-runtime` | Heartbeat scheduler + adapter runner |
| `@agentic/governance` | Approvals, audit log, budget enforcement |

## Development

```bash
npm install
npm run build
npm run test
npm run lint
```

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Project Phases

- **Phase 1** — Foundation: repo structure, tooling, core models, architecture ✅
- **Phase 2** — MVP: task lifecycle, assignment, heartbeat execution ✅
- **Phase 3** — Governance: approvals, audit log, budget controls ✅
- **Phase 4** — Scale: multi-project, integrations, dashboards ✅

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for coding standards, branching strategy, and local development setup.
