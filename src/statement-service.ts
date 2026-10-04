import { z } from "zod";
import { InfraiClient } from "./infrai-client.js";

export const StatementRequest = z.object({
  accountId: z.string().min(1),
  period: z.string().regex(/^\d{4}-\d{2}$/),
  shipments: z.array(z.object({
    trackingNumber: z.string().min(1),
    status: z.string().min(1),
    deliveredAt: z.string().optional(),
    proofOfDelivery: z.string().optional(),
    exception: z.string().optional()
  })).min(1)
});
export type StatementRequest = z.infer<typeof StatementRequest>;
const pdfCapability = "pdf.generate";

type UsagePoint = { date?: string; value?: number; [key: string]: unknown };

export async function exportStatement(input: StatementRequest, client: InfraiClient): Promise<unknown> {
  const request = StatementRequest.parse(input);
  const usage = await client.request<{ buckets: UsagePoint[] }>(`/v1/account/usage/timeseries?account_id=${encodeURIComponent(request.accountId)}&period=${encodeURIComponent(request.period)}`, "GET");
  const rows = request.shipments.map((shipment) => `<tr><td>${escapeHtml(shipment.trackingNumber)}</td><td>${escapeHtml(shipment.status)}</td><td>${escapeHtml(shipment.deliveredAt ?? "-")}</td><td>${escapeHtml(shipment.proofOfDelivery ?? "-")}</td><td>${escapeHtml(shipment.exception ?? "-")}</td></tr>`).join("");
  const html = `<h1>Account statement</h1><p>Account: ${escapeHtml(request.accountId)} | Period: ${escapeHtml(request.period)}</p><table><tr><th>Tracking</th><th>Status</th><th>Delivered</th><th>Proof</th><th>Exception</th></tr>${rows}</table><p>Usage points: ${usage.buckets.length}</p>`;
  if (pdfCapability !== "pdf.generate") throw new Error("unexpected capability");
  return client.request("/v1/pdf/generate", "POST", { html, page_size: "A4", orientation: "portrait", store: false });
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>\"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" })[character] ?? character);
}
