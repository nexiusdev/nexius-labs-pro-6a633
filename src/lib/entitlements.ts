import { supabaseAdmin } from "@/lib/supabase-admin";

const db = supabaseAdmin.schema("nexius_os");

export async function ensureCustomerEntitlements(params: {
  userId: string;
  subscriptionId: string;
  customerId: string;
  roleIds: string[];
  packageIds?: string[];
  packageVersions?: string[];
  contractVersion?: string;
  actor?: string;
}) {
  if (params.roleIds.length === 0) return;

  const actor = params.actor || `user:${params.userId}`;
  const now = new Date().toISOString();
  const packageId = params.packageIds?.[0] || null;
  const packageVersion = params.packageVersions?.[0] || null;
  const contractVersion = params.contractVersion || "v2";

  const rows = params.roleIds.map((roleId) => ({
    user_id: params.userId,
    customer_id: params.customerId,
    subscription_id: params.subscriptionId,
    role_id: roleId,
    status: "active",
    created_by: actor,
    updated_by: actor,
    last_action: "ensure_entitlement",
    last_action_at: now,
    package_id: packageId,
    package_version: packageVersion,
    contract_version: contractVersion,
    entitlement_snapshot: {
      customerId: params.customerId,
      subscriptionId: params.subscriptionId,
      roleId,
      packageId,
      packageVersion,
      contractVersion,
      capturedAt: now,
    },
  }));

  const { error } = await db.from("customer_entitlements").upsert(rows, {
    onConflict: "subscription_id,role_id",
  });

  if (error) {
    throw new Error(error.message);
  }
}
