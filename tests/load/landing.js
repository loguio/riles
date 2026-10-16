// CD-09: landing page burst test (C1/C2 exit criteria).
// Usage: BASE_URL=https://web-riles.netlify.app k6 run tests/load/landing.js
import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "https://deploy-preview-36--web-riles.netlify.app";

export const options = {
  scenarios: {
    burst: {
      executor: "ramping-arrival-rate",
      startRate: 1,
      timeUnit: "1s",
      preAllocatedVUs: 50,
      maxVUs: 120,
      stages: [
        { target: 5, duration: "20s" },
        { target: 20, duration: "40s" }, // peak social burst
        { target: 0, duration: "20s" },
      ],
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.005"],
    http_req_duration: ["p(95)<300"],
  },
};

export default function () {
  const res = http.get(BASE_URL, { tags: { route: "home" } });
  check(res, {
    "status 200": (r) => r.status === 200,
    "no server error": (r) => r.status < 500,
    "home renders hero": (r) => r.body.includes("Riles"),
    "scripts allowed": (r) => r.body.includes("./js/app.js"),
  });
  sleep(1);
}
