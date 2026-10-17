# RILES · Scale Readiness to 10 000 users

Owner goal: keep working until the stack can absorb 10 000 signups/users without
manual intervention, silent degradation, or an unbounded bill.

This document is the contract for that goal: what "ready" means, where we are
today (evidence-based), the ordered backlog, and the 24/7 operating loop.

---

## 1. Definition of "ready for 10k"

Target scenario (worst realistic day):

- 10 000 landing visitors/day, 25 % mobile-first, peak 1500/hour (~0,5 rps
  average, 3–4 rps peak, burst 20 rps from social).
- 3 000 waitlist signups over the campaign (300/day peak).
- 1 000 beta app users, 30 % DAU (300/day), peak 60 concurrent.
- Coach IA messages: ~2 000/day peak (≈1,4/min average, 10/min burst).
- Watch webhooks: Strava/Garmin pushes, 5 000/day.

Exit criteria (all must be green):

| # | Criterion | Measure |
|---|---|---|
| C1 | Landing page TTFB p95 < 300 ms at 20 rps burst, 0 5xx | k6 + Netlify analytics |
| C2 | Landing transfer < 500 KB, LCP < 2,5 s on Moto G4 / 4G | Lighthouse CI |
| C3 | API p95 < 400 ms (non-LLM), p95 < 3 s (LLM) at 60 concurrent | k6 |
| C4 | API error rate < 0,5 % and 429s bounded (< 1 % of peak) | k6 + dashboards |
| C5 | DB: pool saturation < 70 %, no P95 query > 200 ms | pg_stat + APM |
| C6 | LLM spend < €40/day at peak, hard cost cap enforced | counters + alerts |
| C7 | Waitlist capture survives Netlify Forms limits or is moved to API | load test |
| C8 | SLOs + alerts live; on-call rotation and runbooks written | PagerDuty/uptime |
| C9 | CI gates: lint, type-check, tests, build, load-smoke | GitHub Actions |
| C10 | Data lifecycle: retention, GDPR export/delete verified | e2e test |

---

## 2. Current gaps (audited in this repo)

**Landing (`web-riles`)**

- Static Netlify site: fine for 10k *pageviews* (CDN, immutable assets).
- **Gap C7:** waitlist uses Netlify Forms (free tier ≈ 100 submissions/month,
  paid ≈ 1000/month). 3 000+ signups will hit the ceiling → must capture to the
  API/DB (Supabase) with Netlify as fallback, or upgrade + monitor quota.
- **Gap C2:** images/fonts self-hosted and cached, but `/css/*` and `/js/*`
  have no explicit cache headers beyond Netlify defaults; add immutable
  hashing or at least long max-age; set `Strict-Transport-Security`.
- Analytics (PostHog, Clarity, GA4) are consent-gated; verify event volume
  stays inside free tiers at 3k DAU (PostHog 1M events/mo).

**API (`back-riles`)**

- NestJS + Prisma + Supabase Postgres, LLM gateway (Gemini/OpenAI-compatible
  via OmniRoute), datalake exports, Strava/Garmin/Apple webhooks.
- **Gap C6/C3:** no LLM concurrency limit, no per-user daily cap, no circuit
  breaker, no request queue; a burst of coach messages multiplies upstream
  cost and tail latency. Existing code has timeouts + model fallback but no
  retry budget.
- **Gap C8:** no `/health` (DB) exposed publicly, no structured request IDs,
  no latency/error metrics endpoint, no alerting hooks.
- **Gap C4:** no rate limiting (per-IP/per-user); global auth guard protects
  data, but unauthenticated endpoints (auth, waitlist) are unbounded.
- **Gap C5:** Prisma client default pool; Supabase free tier has low
  connection limits → use Supabase pooler (pgBouncer) `DATABASE_URL` and keep
  `connection_limit` tuned.
- **Gap C9:** no CI workflow committed in the submodule (docs cite one);
  add lint/type-check/build/test + load smoke.

**App (`front-riles`)**

- Expo/React Native; needs EAS build profiles, OTA update channel, Sentry/
  crash reporting, API base URL config per environment, offline cache of the
  current plan, and exponential backoff on sync.
- **Gap:** no error reporting / release channeling documented.

---

## 3. Ordered backlog

### P0 — before any real traffic (this week)

1. `CD-01` Add `/health` (DB ping) and `/ready` public endpoints. ✅ started
2. `CD-02` Global rate limit (per-IP + per-user) with 429 + `Retry-After`.
3. `CD-03` Request-ID middleware + structured access logs (latency, status).
4. `CD-04` `/metrics` JSON counters (requests, errors, p95 buckets, LLM calls,
   LLM tokens/cost estimate) for Prometheus/uptime scraping.
5. `CD-05` LLM guard: semaphore (max 3 concurrent), retry budget
   (2 retries, jitter), per-user daily cap (env), cost counter.
6. `CD-06` Prisma: document + enforce pooler URL, statement timeout,
   connection limit; add indexes for hot paths (activities by user/date).
7. `CD-07` `main.ts` hardening: security headers, body limit 256 KB,
   server timeouts, `enableShutdownHooks`, fail-fast env validation.
8. `CD-08` Waitlist: new `POST /waitlist` (rate-limited, honeypot, email
   validation) writing to Supabase; landing code path switches to it, keeps
   Netlify form as backup. **This is the true 10k unlock.**
9. `CD-09` k6 load scripts: landing 20 rps burst; API 60 VU; coach 10 msg/min.
10. `CD-10` CI workflows (back, front): lint → type-check → build → test →
    load-smoke (short).

### P1 — before beta scale (next)

11. `CD-11` Redis (Upstash) for rate limit + LLM cache + idempotency keys.
12. `CD-12` Sentry (app + API) + uptime checks + alert routing.
13. `CD-13` EAS profiles, OTA channel, crash reporting, perf marks in app.
14. `CD-14` Postgres: read replica, pg_stat_statements review, retention job
    for datalake raw partitions, nightly `VACUUM ANALYZE` policy.
15. `CD-15` Cache current plan (ETag + 30 s SWR) to cut DB reads on app start.
16. `CD-16` Backpressure policy for webhooks (queue + idempotent dedupe).

### P2 — before public launch

17. `CD-17` Multi-region/static asset CDN + origin failover.
18. `CD-18` Cost dashboards & budget alarms (LLM, bandwidth, DB, egress).
19. `CD-19` Chaos drills: kill 1 pod, pg failover, LLM outage → degraded mode.
20. `CD-20` Incident runbooks + status page + on-call schedule.

---

## 4. 24/7 operating loop

- **Every push:** CI gate C9 (lint/type-check/build/test). Red = stop.
- **Hourly:** synthetic probes (uptime watch on `/health`, landing LCP).
- **Daily:** k6 smoke at 5× peak; review `/metrics`, LLM cost, error budget.
- **Weekly:** load test at target capacity; rotate runbooks; dependency and
  security audit (`npm audit`, container scan).
- **On-call:** two people, 24 h rotation, PagerDuty → phone; runbooks for
  LLM outage, DB saturation, form quota exhaustion.
- **Change control:** one P0 at a time to `main` via PR, deploy behind
  feature flags, rollback = previous image.

## 5. Budget guardrails (10k scenario)

| Line | Daily peak estimate | Cap/alarm |
|---|---|---|
| LLM (Gemini free tier / OmniRoute) | ~2 000 msgs, 0 € → €12 if paid | alarm €40/day, hard stop €60 |
| Supabase DB (free → Pro) | 300 DAU reads/writes | alarm 80 % connections |
| Netlify (static + forms) | 10k views | alarm at 80 % form quota |
| PostHog/Clarity/GA4 | 3k DAU events | alarm 80 % free tier |
| Sentry | 50k events | alarm 80 % quota |

---

*Status: P0 items CD-01..CD-10 in progress in this work block. Update the
checkbox column as they land.*
