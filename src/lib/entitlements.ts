import { supabaseAdmin } from "@/lib/supabase-admin";

const db = supabaseAdmin.schema("nexius_os");

export async function ensureCustomerEntitlements(params: {
  userId: string;
  subscriptionId: string;
  customerId: string;
  roleIds: string[];
  actor?: string;
}) {
  if (params.roleIds.length === 0) return;

  const actor = params.actor || `user:${params.userId}`;
  const now = new Date().toISOString();

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
  }));

  const { error } = await db.from("customer_entitlements").upsert(rows, {
    onConflict: "subscription_id,role_id",
  });

  if (error) {
    throw new Error(error.message);
  }
}
