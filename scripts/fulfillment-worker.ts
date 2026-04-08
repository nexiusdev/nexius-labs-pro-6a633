import { processFulfillmentJobs } from "../src/lib/fulfillment";

async function main() {
  const limit = Math.min(100, Math.max(1, Number(process.env.FULFILLMENT_WORKER_LIMIT || "20")));
  const result = await processFulfillmentJobs(limit);
  console.log(JSON.stringify({ ok: true, limit, ...result }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
