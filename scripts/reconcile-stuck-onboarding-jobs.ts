import { reconcileStuckInProgressJobs, validateControlEnv } from "../src/lib/fulfillment";

async function main() {
  const envCheck = validateControlEnv();
  if (!envCheck.ok) {
    throw new Error(`Missing required control env vars: ${envCheck.missing.join(", ")}`);
  }

  const limit = Math.min(200, Math.max(1, Number(process.env.FULFILLMENT_STUCK_RECONCILE_LIMIT || "50")));
  const result = await reconcileStuckInProgressJobs(limit);
  console.log(JSON.stringify({ ok: true, ...result }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
