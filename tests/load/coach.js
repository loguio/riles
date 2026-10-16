// CD-09: coach/LLM load test (C4/C6 exit criteria).
// Usage: BASE_URL=https://api.riles.run TOKEN=<user jwt> k6 run tests/load/coach.js
//
// This test hammers the LLM-backed endpoint, which is the most expensive and
// least predictable path in the stack. It is scheduled from CI only with a
// dedicated low-cost model, and never against production without a budget cap.
import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const TOKEN = __ENV.TOKEN || "";
const PREFIX = __ENV.API_PREFIX || "api/v1";

export const options = {
  stages: [
    { duration: "30s", target: 3 },
    { duration: "90s", target: 10 }, // 10 messages/minute burst
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<3000"],
    http_req_failed: ["rate<0.01"],
  },
};

const MESSAGE = "J'ai seulement 30 minutes ce soir, qu'est-ce que je fais ?";

export default function () {
  if (!TOKEN) {
    // Without a token the endpoint must answer 401, never 5xx: that is still a
    // valid load signal for the auth + rate-limit layers.
    const res = http.post(`${BASE_URL}/${PREFIX}/coach/message`, JSON.stringify({ message: MESSAGE }), {
      headers: { "Content-Type": "application/json" },
    });
    check(res, { "no 5xx": (r) => r.status < 500 });
  } else {
    const res = http.post(
      `${BASE_URL}/${PREFIX}/coach/message`,
      JSON.stringify({ message: MESSAGE }),
      { headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` } },
    );
    check(res, {
      "answer or rate limited": (r) => r.status === 200 || r.status === 429,
      "not a server error": (r) => r.status < 500,
    });
  }
  sleep(6);
}
