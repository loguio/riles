# Load tests (CD-09)

| Script | What it proves | Thresholds |
|---|---|---|
| `landing.js` | CD-01: static landing survives a 20 rps social burst with 0 5xx | p95 < 300 ms, error < 0,5 % |
| `api.js` | CD-03: API answers health/readiness at 60 concurrent | p95 < 400 ms, error < 0,5 % |
| `coach.js` | CD-06: LLM path stays under budget and inside rate limits | p95 < 3 s, 429 < 1 % |

Run locally against `docker compose up` in `back-riles`:

```bash
BASE_URL=http://localhost:3000 k6 run tests/load/api.js
```

Install k6: https://k6.io/docs/get-started/installation/
