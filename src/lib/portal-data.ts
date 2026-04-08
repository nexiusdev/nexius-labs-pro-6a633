import { supabaseAdmin } from "@/lib/supabase-admin";
import { redactSensitive } from "@/lib/redaction";

const db = supabaseAdmin.schema("nexius_os");

export async function getUserSubscriptions(userId: string) {
  const { data, error } = await db
    .from("subscriptions")
    .select("id,status,monthly_amount,currency,role_ids,package_ids,package_versions,sku_codes,purchase_snapshot,created_at,updated_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getLatestJobForSubscriptionIds(subscriptionIds: string[]) {
  if (subscriptionIds.length === 0) return [];

  const { data, error } = await db
    .from("onboarding_jobs")
    .select("id,subscription_id,customer_id,state,error_code,error_message,error_stage,request_payload,response_payload,provision_mode,retry_count,updated_at")
    .in("subscription_id", subscriptionIds)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);

  const map = new Map<string, Record<string, unknown>>();
  for (const row of data || []) {
    const key = String(row.subscription_id);
    if (map.has(key)) continue;
    map.set(key, row as unknown as Record<string, unknown>);
  }

  return [...map.values()];
}

export function mapStatus(state: string) {
  const s = state.toLowerCase();
  if (s === "completed") return "ready";
  if (s === "in_progress" || s === "tenant_request_sent" || s === "package_resolved") return "installing";
  if (s === "payment_confirmed") return "needs_action";
  if (s === "failed") return "needs_action";
  return "needs_action";
}

export async function insertPortalAuditEvent(params: {
  userId: string;
  customerId?: string | null;
  eventType: string;
  payload: Record<string, unknown>;
  actor?: string;
}) {
  const { error } = await db.from("portal_audit_events").insert({
    user_id: params.userId,
    customer_id: params.customerId || null,
    event_type: params.eventType,
    payload: redactSensitive(params.payload),
    created_by: params.actor || `user:${params.userId}`,
  });

  if (error) throw new Error(error.message);
}

export async function getPortalAuditHistory(userId: string, limit = 200) {
  const { data, error } = await db
    .from("portal_audit_events")
    .select("id,event_type,payload,created_at,created_by,customer_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data || [];
}
