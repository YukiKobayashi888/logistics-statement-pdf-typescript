import assert from "node:assert/strict";
import { exportStatement, StatementRequest } from "./statement-service.js";

const calls: Array<{ path: string; method: string; body?: unknown }> = [];
const fake = { request: async (path: string, method: "GET" | "POST", body?: unknown) => {
  calls.push({ path, method, body });
  if (method === "GET") return { buckets: [{ date: "2026-09-01", value: 12 }] };
  return { id: "pdf-1", status: "ready" };
} } as never;

const input = StatementRequest.parse({ accountId: "acct-7", period: "2026-09", shipments: [{ trackingNumber: "T-1", status: "exception", exception: "address" }] });
const result = await exportStatement(input, fake);
assert.deepEqual(result, { id: "pdf-1", status: "ready" });
assert.equal(calls[0].path, "/v1/account/usage/timeseries?account_id=acct-7&period=2026-09");
assert.equal(calls[1].method, "POST");
assert.match(String((calls[1].body as { html: string }).html), /exception/);
assert.match(String((calls[1].body as { html: string }).html), /Usage points: 1/);
console.log("statement decision test passed");
