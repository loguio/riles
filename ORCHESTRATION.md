# ORCHESTRATION — Phase 5B

Working plan and review log for the Phase 5B orchestration (Running Clubs backend,
viral story sharing, subscription soft-paywall). Source of truth for scope is
[`ROADMAP.md`](./ROADMAP.md) (Phase 5B, lines 116-128); this file is the working
scratchpad, `ROADMAP.md` stays the product spec of record.

**Status: COMPLETE & MERGED** — 4 iterations, 3 apps, all merged to `master`.

## Operating model

- **Orchestrator** (lead agent): owns this file, sequences iterations, runs the
  final critic pass, and reports to the user. Does not write app code directly.
- **Three teams**, one per app: `front-riles`, `back-riles`, `landing-riles`.
  Each team has three roles — **Lead/architect**, **Implementer**, **Verifier**.
- **Critic** (per app, per batch): an independent agent that did not write the
  code reviews the batch and returns a verdict — `accept` or `rework` — with
  prioritized findings.
- **Reviewer agent** (per app, per batch): a dedicated agent that did not write
  the code reads the diff and posts **line-level comments on the pull request**
  (`gh pr review` / inline comments). Each finding is tagged `blocking`
  (P0/P1) or `non-blocking` (P2). Blocking findings feed the rework pass before
  the gate closes.
- **Loop per batch**: Implement → Verify (DoD) → Critic (verdict) → **Reviewer
  (comments on the PR)** → Rework if needed → Gate.
- **Isolation**: each team works on its own branch inside its own submodule, and
  never pushes to `master` directly — work lands as a **pull request** so the
  reviewer has a place to comment. The user approves merges.
- **Definition of Done**: `lint` + `type-check` + tests + build pass in that
  repo, and the independent Verifier signs off. Self-report never counts.

## Pull requests

| App | PR | State |
| --- | --- | --- |
| `front-riles` | [#24](https://github.com/loguio/front-riles/pull/24) | merged (`5ad0e84`) |
| `front-riles` | [#25](https://github.com/loguio/front-riles/pull/25) | merged (`a84aab5`) — reviewer nits |
| `front-riles` | [#26](https://github.com/loguio/front-riles/pull/26) | merged (`52f2e1e`) — prettier / green CI |
| `back-riles` | [#52](https://github.com/loguio/back-riles/pull/52) | merged (`614d923`) — lint + CI migrate skip |
| `riles` | [#12](https://github.com/loguio/riles/pull/12) | merged (`0899080`) — green docs-lint |
| `back-riles` | — | Phase 5B merged (`97fa486`) |
| `landing-riles` | — | Phase 5B merged (`62b5cb7`) |

## Branches

| App | Branch | Base | Tip |
| --- | --- | --- | --- |
| `back-riles` | `feat/phase5b-back` | `bf7b0c0` | `ea81aea` (merged) |
| `front-riles` | `merge/phase5b-front` | `c5e88cd` | `da3b17c` |
| `landing-riles` | `feat/phase5b-landing` | `master` | `8b9933e` (merged) |

## Final verification (orchestrator, independent)

| App | Tests | Type-check | Lint | Build |
| --- | --- | --- | --- | --- |
| `back-riles` | 33 suites / 374 pass | clean | 3 pre-existing errors | pass |
| `front-riles` | vitest 118 + jest 30 pass | clean | 0 errors / 91 pre-existing warnings | — |
| `landing-riles` | 18 pass | — | clean | static |

## Backlog — final

All Phase 5B tasks done. See the previous revision history in git for the
per-task tables (B1-B8, F0-F7, L1-L4, X1). Summary:

- **back-riles**: community models + `CommunityModule`, plan gating
  (`trialEndsAt`/`isPro`/`@RequirePro`), stubbed `BillingProvider` + webhook +
  `PAYWALL_ENFORCED` flag, full test coverage.
- **front-riles**: real-API community service + UI states, shareable session
  card, soft paywall + trial state, test infra (jest + vitest).
- **landing-riles**: public Running Clubs section, PRO/trial copy alignment.

## Iteration plan — final

| Iteration | Batches | Gate |
| --- | --- | --- |
| 0 — foundations | B1, F0, X1 | done — accept (3×) |
| 1 — core | B6, B2, B3, F6, F3, L3 | done — back accept; front + landing rework → accept |
| 2 — integration | F1, F2, B5, B7, B8, F7, L2, L4 | done — front + landing accept; back rework → accept |
| 3 — monetization | B4, F4, F5, L1 + follow-ups | done — landing accept; back + front rework → accept |

## Review log

| Iteration | App | Verdict | Headline findings |
| --- | --- | --- | --- |
| 0 | back-riles | accept | contract 422 vs real 400; no DTO test |
| 0 | front-riles | accept | RNTL skip rationale wrong |
| 0 | landing-riles | accept | two card-policy strings missed |
| 1 | back-riles | accept | no service/guard tests; N+1; undocumented filters |
| 1 | front-riles | rework → accept | blank Android capture; swallowed errors |
| 1 | landing-riles | rework → accept | `PRO` token claim factually wrong |
| 2 | back-riles | rework → accept | date-fragile test; stub masked the window query |
| 2 | front-riles | accept | not optimistic; empty flash; only first challenge |
| 2 | landing-riles | accept | copy-plan anchors drifted after L2 |
| 3 | back-riles | rework → accept | public billing webhook used a repo-known secret |
| 3 | front-riles | rework → accept | cold-cache jest timeout flake |
| 3 | landing-riles | accept | anchors drifted +2 after the trial edit |
| — | front-riles | reviewer | PR #24: 6 comments (2 blocking) → both fixed in `bf918e4` + `fcd5f2f` → re-review confirmed resolved |

## Resolved decisions

1. Landing team stayed as a small team: L1 + L2.
2. `front-riles` got test infra first (F0).
3. Billing provider: **RevenueCat**, built as a stubbed `BillingProvider` seam.
4. `PlanType`: `BASIC` + 14-day `PRO` trial mechanism built; beta left on `PRO`
   (enforcement is a flag, default off).

## Hardening (post-merge)

After the merges, CI was audited across all four repos and three pipelines were
found red — all pre-existing, none caused by Phase 5B:

| Repo | Problem | Fix (PR) |
| --- | --- | --- |
| `riles` | `docs-lint` failing: 20 markdownlint errors in `SCALE_READINESS.md` | [#12](https://github.com/loguio/riles/pull/12) — blank lines + disable `MD029` |
| `back-riles` | `lint` failing on 3 unused-var errors; `migrate deploy` failing on unset secrets | [#52](https://github.com/loguio/back-riles/pull/52) |
| `front-riles` | `format:check` failing on 6 Phase 5B files | [#26](https://github.com/loguio/front-riles/pull/26) |
| `landing-riles` | already green | — |

All four pipelines are now green. Known residual: one non-reproducing test flake
seen once in `back-riles` `npm test` (3 clean re-runs afterwards) — not
identified, left as a watch item.

## Handoff — how to finish

1. **All merged.** `front-riles` #24 and #25, plus `back-riles` and
   `landing-riles` are on `master`.
2. **Bump the parent submodule pointers** in `riles` to the merged commits.
3. **Enable the paywall** (when ready): set `BILLING_WEBHOOK_SECRET`,
   `PAYWALL_ENFORCED=true`, flip the Prisma `planType` default to `BASIC`,
   migrate. See `back-riles/BILLING.md`.
4. **Swap in RevenueCat**: one provider binding (back) + a real client (front).
5. **Pending business terms** (do not invent): PRO price, the founder
   `-50 % à vie` promise, card-collection timing. Tracked in
   `landing-riles/PHASE5B-COPY-PLAN.md` §6.
