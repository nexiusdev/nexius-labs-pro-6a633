import { Client } from "pg";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const applyFixes = process.argv.includes("--apply");

type SubscriptionRow = {
  id: string;
  user_id: string;
  role_ids: string[];
};

async function main() {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    const subscriptions = await client.query<SubscriptionRow>(
      `select id, user_id::text, role_ids
       from nexius_os.subscriptions
       where status = 'active'
       order by created_at desc`
    );

    const missingEntitlements: Array<{ subscriptionId: string; userId: string; roleId: string; customerId: string }> = [];
    const missingJobs: string[] = [];

    for (const subscription of subscriptions.rows) {
      const customerId = `customer-${subscription.id.replace(/-/g, "").slice(0, 8)}`;

      const entitlements = await client.query<{ role_id: string }>(
        `select role_id
         from nexius_os.customer_entitlements
         where subscription_id = $1`,
        [subscription.id]
      );

      const existingRoles = new Set(entitlements.rows.map((row) => row.role_id));
      for (const roleId of subscription.role_ids || []) {
        if (!existingRoles.has(roleId)) {
          missingEntitlements.push({
            subscriptionId: subscription.id,
            userId: subscription.user_id,
            roleId,
            customerId,
          });
        }
      }

      const jobs = await client.query<{ id: string }>(
        `select id
         from nexius_os.onboarding_jobs
         where subscription_id = $1
         limit 1`,
        [subscription.id]
      );

      if (jobs.rowCount === 0) {
        missingJobs.push(subscription.id);
      }
    }

    console.log("Reconciliation summary");
    console.log(
      JSON.stringify(
        {
          activeSubscriptions: subscriptions.rowCount,
          missingEntitlements: missingEntitlements.length,
          subscriptionsMissingOnboardingJobs: missingJobs.length,
          applyFixes,
        },
        null,
        2
      )
    );

    if (missingEntitlements.length > 0) {
      console.log("Missing entitlements:");
      for (const row of missingEntitlements) {
        console.log(`- subscription=${row.subscriptionId} role=${row.roleId}`);
      }
    }

    if (missingJobs.length > 0) {
      console.log("Subscriptions missing onboarding jobs:");
      for (const subscriptionId of missingJobs) {
        console.log(`- ${subscriptionId}`);
      }
    }

    if (!applyFixes || missingEntitlements.length === 0) {
      return;
    }

    await client.query("begin");
    for (const row of missingEntitlements) {
      await client.query(
        `insert into nexius_os.customer_entitlements
          (user_id, customer_id, subscription_id, role_id, status, created_by, updated_by, last_action, last_action_at, created_at, updated_at)
         values ($1,$2,$3,$4,'active',$5,$5,'reconcile_backfill',now(),now(),now())
         on conflict (subscription_id, role_id) do nothing`,
        [row.userId, row.customerId, row.subscriptionId, row.roleId, "script:reconcile-vps-a-onboarding"]
      );
    }
    await client.query("commit");
    console.log(`Applied ${missingEntitlements.length} missing entitlement backfills.`);
  } catch (error) {
    await client.query("rollback").catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
