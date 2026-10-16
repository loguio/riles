// CD-09: API load test for /health, /ready (C1/C5).
// Usage: BASE_URL=https://api.riles.run k6 run tests/load/api.js
import http from "k6/http";
import { check } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export const options = {
  stages: [
    { duration: "30s", target: 20 }, // ramp
    { duration: "2m", target: 60 }, // sustained concurrency
    { duration: "30s", target: 0 }, // cool down
  ],
  thresholds: {
    http_req_failed: ["rate<0.005"],
    http_req_duration: ["p(95)<400"],
  },
};

export default function () {
  const health = http.get(`${BASE_URL}/health`);
  check(health, { "health ok": (r) => r.status === 200 });
  const ready = http.get(`${BASE_URL}/ready`);
  check(ready, { "ready ok": (r) => r.status === 200 });
}
