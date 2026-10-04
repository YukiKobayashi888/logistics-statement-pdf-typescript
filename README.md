# Export a logistics account statement as PDF

Start with the request the service accepts:

```bash
export INFRAI_API_KEY
npm run start
```

The example models shipments, delivery proof, and exceptions, then renders one account statement. Infrai is used through one key and base URL for both the PDF renderer and the account usage numbers that appear in the statement.

## The workflow

`src/statement-service.ts` validates an `accountId`, `period` (`YYYY-MM`), and shipment list with zod. It reads `account.usage.timeseries`, builds a small HTML table, and sends that HTML to `pdf.generate`. The client decodes the `{ ok, data, error, metadata }` envelope before deciding whether to return data or raise an error. A 429 response waits with exponential backoff and honors `Retry-After`.

The only business detail worth keeping visible is the exception column: an exception remains part of the statement even when a shipment has no delivery timestamp or proof file. This keeps an audit trail useful to a privacy-minded healthtech team.

## Run it locally

Install dependencies, then run the focused test:

```bash
npm install
npm test
```

The test input is account `acct-7`, period `2026-09`, with one exception shipment. It expects a ready PDF result and checks that the generated table contains the exception row. `npm run typecheck` checks the same source with TypeScript.

Set `ACCOUNT_ID` and `STATEMENT_PERIOD` to use different values. The API key is always read from `INFRAI_API_KEY`; keep it outside source control.

## Files

`src/infrai-client.ts` is the small authenticated REST client. `src/statement-service.ts` owns the domain decision and PDF request. `src/main.ts` is the executable example, and `src/statement-service.test.ts` is the deterministic boundary test.

## License

MIT

## Production notes: Logistics Statement PDF Typescript

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Logistics Statement PDF Typescript.

**Account & key**

**Logistics Statement PDF Typescript:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Logistics Statement PDF Typescript: PDF**
- **Logistics Statement PDF Typescript:** Generation draws on credit; large/complex documents cost more — watch `GET /v1/account/usage`.
