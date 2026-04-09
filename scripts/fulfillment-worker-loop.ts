import { processFulfillmentJobs, reconcileStuckInProgressJobs, validateControlEnv } from "../src/lib/fulfillment";

const intervalMs = Math.max(5_000, Number(process.env.FULFILLMENT_WORKER_INTERVAL_MS || 15_000));
const batchSize = Math.max(1, Number(process.env.FULFILLMENT_WORKER_BATCH_SIZE || 10));
const reconcileLimit = Math.max(1, Number(process.env.FULFILLMENT_STUCK_RECONCILE_LIMIT || 10));
const reconcileEnabled = String(process.env.FULFILLMENT_RECONCILE_STUCK || "true").toLowerCase() !== "false";

async function tick() {
  try {
    const result = await processFulfillmentJobs(batchSize);
    const reconcile = reconcileEnabled ? await reconcileStuckInProgressJobs(reconcileLimit) : { processed: 0 };
    const now = new Date().toISOString();
    console.log(`[${now}] fulfillment-worker-loop processed=${result.processed} reconciled_stuck=${reconcile.processed}`);
  } catch (error) {
    const now = new Date().toISOString();
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[${now}] fulfillment-worker-loop error=${message}`);
  }
}

async function main() {
  const envCheck = validateControlEnv();
  if (!envCheck.ok) {
    throw new Error(`Missing required control env vars: ${envCheck.missing.join(", ")}`);
  }

  await tick();
  setInterval(() => {
    void tick();
  }, intervalMs);
}

void main();
