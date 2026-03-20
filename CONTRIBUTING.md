# Contributing to Agentic Platform

## Branching Strategy

We use a trunk-based workflow:

- `main` — always deployable; protected branch
- Feature work: short-lived branches off `main`, named `<type>/<short-description>`
  - `feat/issue-search-endpoint`
  - `fix/checkout-race-condition`
  - `chore/update-drizzle`
- Merge via PR; squash merge to keep history clean
- Delete branches after merge

## Coding Standards

### TypeScript

- Strict mode is enforced (`strict: true`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`). No `any`, no `as` casts without a comment explaining why.
- ESM modules only (`"type": "module"` in each package). Use `.js` extensions in imports.
- Run type checking with `npm run lint` before pushing.

### Package layout

```
packages/<name>/src/
  index.ts          # Re-exports only — no logic here
  models/           # Domain types and interfaces
  services/         # Business logic
  routes/           # HTTP route handlers (api package only)
  lib/              # Internal utilities
  *.test.ts         # Co-located unit tests
```

### Tests

- Tests live next to the files they test (`foo.test.ts` beside `foo.ts`).
- Use Node's built-in `node:test` runner — no external test framework.
- All new logic must have at least one test. PRs adding features without tests will not be merged.
- Run tests: `npm run test`

### Database / Drizzle

- All schema changes go in `packages/api/src/db/schema.ts`.
- Generate migrations with `npm run db:generate -w packages/api` and commit them.
- Never write raw SQL in application code — use Drizzle query builders.

### Error handling

- Throw domain errors from `@agentic/core` (e.g. `NotFoundError`, `ConflictError`).
- The API error handler in `packages/api/src/lib/error-handler.ts` maps these to HTTP status codes automatically.
- Never let unhandled promise rejections escape — always `await` or chain `.catch()`.

### Commits

- Follow Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`
- Keep commits focused — one logical change per commit
- If making commits as an AI agent: append `Co-Authored-By: Paperclip <noreply@paperclip.ing>`

## Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your local values

# Run database migrations
npm run db:migrate -w packages/api

# Start the API in watch mode
npm run dev

# Build all packages
npm run build

# Run all tests
npm run test

# Type-check without emitting
npm run lint
```

## CI

Every PR runs:

1. `npm run lint` — TypeScript strict type check
2. `npm run build` — compile all packages
3. `npm run test` — unit + integration tests
4. `npm audit --audit-level=high` — dependency vulnerability scan

All checks must pass before merging.

## Pull Request Guidelines

- Keep PRs small and focused — easier to review, easier to revert
- Link the related issue in the PR description
- Add a brief "what changed and why" in the PR body
- Self-review your diff before requesting a human review
