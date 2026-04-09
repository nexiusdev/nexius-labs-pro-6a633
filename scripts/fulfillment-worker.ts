import { processFulfillmentJobs, reconcileStuckInProgressJobs, validateControlEnv } from "../src/lib/fulfillment";

async function main() {
  const envCheck = validateControlEnv();
  if (!envCheck.ok) {
    throw new Error(`Missing required control env vars: ${envCheck.missing.join(", ")}`);
  }

  const limit = Math.min(100, Math.max(1, Number(process.env.FULFILLMENT_WORKER_LIMIT || "20")));
  const reconcileLimit = Math.min(100, Math.max(1, Number(process.env.FULFILLMENT_STUCK_RECONCILE_LIMIT || "20")));

  const result = await processFulfillmentJobs(limit);
  const reconcile = await reconcileStuckInProgressJobs(reconcileLimit);
  console.log(JSON.stringify({ ok: true, limit, ...result, reconcile }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
