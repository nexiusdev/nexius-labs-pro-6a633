import { supabaseAdmin } from "@/lib/supabase-admin";

const db = supabaseAdmin.schema("nexius_os");

export async function ensureCustomerEntitlements(params: {
  userId: string;
  subscriptionId: string;
  customerId: string;
  roleIds: string[];
}) {
  if (params.roleIds.length === 0) return;

  const rows = params.roleIds.map((roleId) => ({
    user_id: params.userId,
    customer_id: params.customerId,
    subscription_id: params.subscriptionId,
    role_id: roleId,
    status: "active",
  }));

  const { error } = await db.from("customer_entitlements").upsert(rows, {
    onConflict: "subscription_id,role_id",
  });

  if (error) {
    throw new Error(error.message);
  }
}
