import { supabaseAdmin } from "@/lib/supabase-admin";
import { redactSensitive } from "@/lib/redaction";

const db = supabaseAdmin.schema("nexius_os");

export async function getDashboardSummary() {
  const [payments, inProgress, failed, incompleteOnboarding] = await Promise.all([
    db.from("payment_events").select("id", { count: "exact", head: true }).eq("status", "received"),
    db.from("onboarding_jobs").select("id", { count: "exact", head: true }).in("state", ["in_progress", "tenant_request_sent", "package_resolved"]),
    db.from("onboarding_jobs").select("id", { count: "exact", head: true }).eq("state", "failed"),
    db.from("onboarding_jobs").select("id", { count: "exact", head: true }).in("state", ["payment_confirmed", "failed"]),
  ]);

  return {
    pendingPayments: payments.count || 0,
    installsInProgress: inProgress.count || 0,
    failedJobs: failed.count || 0,
    incompleteOnboarding: incompleteOnboarding.count || 0,
  };
}

export async function getPayments(limit = 100) {
  const { data, error } = await db
    .from("payment_events")
    .select("id,provider,provider_event_id,provider_payment_id,provider_session_id,provider_subscription_id,subscription_id,status,error_code,error_message,received_at,processed_at,retry_count")
    .order("received_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getPaymentById(paymentId: string) {
  const { data, error } = await db
    .from("payment_events")
    .select("*")
    .eq("id", paymentId)
    .single();

  if (error) throw new Error(error.message);
  return redactSensitive(data);
}

export async function getClients(limit = 100) {
  const { data, error } = await db
    .from("subscriptions")
    .select("id,user_id,status,customer_entitlements(customer_id),created_at,updated_at")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  const rows = data || [];
  const byCustomer = new Map<string, { customerId: string; subscriptionCount: number; statuses: Set<string>; updatedAt: string | null }>();

  for (const row of rows) {
    const entRows = Array.isArray(row.customer_entitlements)
      ? row.customer_entitlements
      : row.customer_entitlements
        ? [row.customer_entitlements]
        : [];
    const customerId = entRows[0]?.customer_id ? String(entRows[0].customer_id) : `customer-${String(row.id).replace(/-/g, "").slice(0, 8)}`;

    const current = byCustomer.get(customerId) || {
      customerId,
      subscriptionCount: 0,
      statuses: new Set<string>(),
      updatedAt: null,
    };

    current.subscriptionCount += 1;
    current.statuses.add(String(row.status || ""));

    const updatedAt = row.updated_at ? String(row.updated_at) : row.created_at ? String(row.created_at) : null;
    if (updatedAt && (!current.updatedAt || updatedAt > current.updatedAt)) {
      current.updatedAt = updatedAt;
    }

    byCustomer.set(customerId, current);
  }

  return [...byCustomer.values()].map((item) => ({
    customerId: item.customerId,
    subscriptionCount: item.subscriptionCount,
    statuses: [...item.statuses],
    updatedAt: item.updatedAt,
  }));
}

export async function getClientDetail(clientId: string) {
  const [entitlementsRes, jobsRes, mappingRes] = await Promise.all([
    db
      .from("customer_entitlements")
      .select("id,customer_id,subscription_id,role_id,status,package_id,package_version,contract_version,created_at,updated_at")
      .eq("customer_id", clientId)
      .order("updated_at", { ascending: false }),
    db
      .from("onboarding_jobs")
      .select("id,customer_id,subscription_id,state,error_code,error_message,error_stage,retry_count,provision_mode,created_at,updated_at")
      .eq("customer_id", clientId)
      .order("updated_at", { ascending: false })
      .limit(100),
    db
      .from("customer_tenant_mappings")
      .select("id,customer_id,tenant_id,status,created_at,updated_at")
      .eq("customer_id", clientId)
      .maybeSingle(),
  ]);

  if (entitlementsRes.error) throw new Error(entitlementsRes.error.message);
  if (jobsRes.error) throw new Error(jobsRes.error.message);
  if (mappingRes.error) throw new Error(mappingRes.error.message);
  const subscriptionIds = [...new Set((jobsRes.data || []).map((job) => String(job.subscription_id || "")).filter(Boolean))];
  const subscriptionsRes = subscriptionIds.length === 0
    ? { data: [], error: null }
    : await db
      .from("subscriptions")
      .select("id,user_id,status,monthly_amount,currency,role_ids,provider_subscription_id,created_at,updated_at")
      .in("id", subscriptionIds);
  if (subscriptionsRes.error) throw new Error(subscriptionsRes.error.message);

  return {
    customerId: clientId,
    tenantMapping: mappingRes.data || null,
    entitlements: entitlementsRes.data || [],
    jobs: jobsRes.data || [],
    subscriptions: subscriptionsRes.data || [],
  };
}

export async function getJobs(limit = 100) {
  const { data, error } = await db
    .from("onboarding_jobs")
    .select("id,customer_id,subscription_id,state,error_code,error_message,error_stage,retry_count,provision_mode,created_at,updated_at")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getJobDetail(jobId: string) {
  const [jobRes, eventsRes] = await Promise.all([
    db
      .from("onboarding_jobs")
      .select("*")
      .eq("id", jobId)
      .single(),
    db
      .from("onboarding_job_events")
      .select("id,state,stage,detail,actor,created_at")
      .eq("onboarding_job_id", jobId)
      .order("created_at", { ascending: true }),
  ]);

  if (jobRes.error) throw new Error(jobRes.error.message);
  if (eventsRes.error) throw new Error(eventsRes.error.message);

  return {
    job: redactSensitive(jobRes.data),
    events: redactSensitive(eventsRes.data || []),
  };
}

export async function getAuditEvents(limit = 200) {
  const { data, error } = await db
    .from("onboarding_job_events")
    .select("id,onboarding_job_id,state,stage,detail,actor,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return redactSensitive(data || []);
}
