# Testing strategy — RILES

Status: baseline established (RILES-034 / RILES-040 / RILES-038).
This document defines how tests are organised across the four repos and what
"green" means for a change.

## Principles

1. Every repo has a `test` (or `ci`) npm script that exits non-zero on failure.
2. CI runs lint + type-check + tests on every push and pull request to the
   default branch. A change without green CI does not merge.
3. Tests cover pure logic first (training math, validation, reducers, prompt
   builders). Network, database and LLM calls are always mocked in unit tests.
4. Tests never hit real external services (Strava, LLM providers, datalake).

## Per repo

| Repo | Runner | Command | Covers |
|---|---|---|---|
| `back-riles` | Jest | `npm test` | Unit tests for services/DTOs/logic with mocked Prisma/LLM |
| `front-riles` | Vitest | `npm test` | Pure-TS modules: services, utils, reducers (no RN runtime needed) |
| `web-riles` | node:test | `npm test` | Document structure, robots/sitemap invariants |
| `riles` (this repo) | markdownlint-cli2 | `npx markdownlint-cli2` | Spec/docs formatting; submodule pins checked in CI |

Run everything locally before pushing:

```bash
cd <repo> && npm ci && npm run lint && npm run type-check && npm test
# web-riles: npm run ci
```

## CI

Each repo ships `.github/workflows/ci.yml` running on `push` and
`pull_request` to the default branch:

- **back-riles**: `npm ci` → `prisma generate` → lint → type-check → build → test
- **front-riles**: `npm ci` → lint → type-check → test
- **web-riles**: `npm ci` → lint → format:check → test
- **riles**: markdownlint on root docs + submodule pin verification

## Gaps (accepted for now, tracked by issues)

- No end-to-end or integration tests against a real database — add once
  Prisma migrations land (RILES-030).
- No visual/snapshot tests for the Expo UI (needs `jest-expo` preset).
- Coverage thresholds not enforced yet; enable after the test count is
  meaningful.
