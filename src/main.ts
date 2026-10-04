import { InfraiClient } from "./infrai-client.js";
import { exportStatement, StatementRequest } from "./statement-service.js";

const key = process.env.INFRAI_API_KEY;
if (!key) throw new Error("Set INFRAI_API_KEY before running the example");

const client = new InfraiClient(key);
const accountId = process.env.ACCOUNT_ID ?? (await client.request<{ account_id: string }>("/v1/account/whoami", "GET")).account_id;
const input = StatementRequest.parse({
  accountId,
  period: process.env.STATEMENT_PERIOD ?? "2026-09",
  shipments: [{ trackingNumber: "TRK-1001", status: "delivered", deliveredAt: "2026-09-03", proofOfDelivery: "signed-by-recipient" }]
});
const result = await exportStatement(input, client);
console.log(JSON.stringify(result, null, 2));
