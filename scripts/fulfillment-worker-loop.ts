import { processFulfillmentJobs } from "../src/lib/fulfillment";

const intervalMs = Math.max(5_000, Number(process.env.FULFILLMENT_WORKER_INTERVAL_MS || 15_000));
const batchSize = Math.max(1, Number(process.env.FULFILLMENT_WORKER_BATCH_SIZE || 10));

async function tick() {
  try {
    const result = await processFulfillmentJobs(batchSize);
    const now = new Date().toISOString();
    console.log(`[${now}] fulfillment-worker-loop processed=${result.processed}`);
  } catch (error) {
    const now = new Date().toISOString();
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[${now}] fulfillment-worker-loop error=${message}`);
  }
}

async function main() {
  await tick();
  setInterval(() => {
    void tick();
  }, intervalMs);
}

void main();

