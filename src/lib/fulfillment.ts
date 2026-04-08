import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  buildFulfillmentCorrelationId,
  buildFulfillmentIdempotencyKey,
  type PurchaseSnapshot,
} from "@/lib/purchase-snapshot";
import { ensureCustomerEntitlements } from "@/lib/entitlements";

const db = supabaseAdmin.schema("nexius_os");

const TERMINAL_STATES = new Set(["completed"]);
const RETRYABLE_FAILURE_STATES = new Set(["failed"]);

export type FulfillmentState =
  | "payment_confirmed"
  | "package_resolved"
  | "tenant_request_sent"
  | "in_progress"
  | "completed"
  | "failed";

export type EnsureFulfillmentJobInput = {
  subscriptionId: string;
  userId: string;
  customerId: string;
  paymentEventId?: string | null;
  snapshot: PurchaseSnapshot;
};

function controlConfig() {
  const token = (process.env.NEXIUS_CONTROL_ONBOARDING_TOKEN || "").trim();

  const explicitEndpoint = (process.env.NEXIUS_CONTROL_ONBOARDING_URL || "").trim();
  const baseUrl = (process.env.NEXIUS_CONTROL_BASE_URL || "").trim();
  const endpoint = explicitEndpoint || (baseUrl ? `${baseUrl.replace(/\/$/, "")}/v1/tenants/onboard` : "");

  return { endpoint, token };
}

function controlBaseFromEndpoint(endpoint: string) {
  const trimmed = endpoint.trim();
  if (!trimmed) return "";
  if (trimmed.endsWith("/v1/tenants/onboard")) return trimmed.slice(0, -"/v1/tenants/onboard".length);
  return trimmed.replace(/\/$/, "");
}

export function buildCustomerIdFromSubscription(subscriptionId: string) {
  const compact = subscriptionId.replace(/-/g, "").toLowerCase().slice(0, 8);
  return `customer-${compact}`;
}

async function recordJobEvent(params: {
  onboardingJobId: string;
  state: string;
  stage?: string;
  detail?: Record<string, unknown>;
  actor?: string;
}) {
  await db.from("onboarding_job_events").insert({
    onboarding_job_id: params.onboardingJobId,
    state: params.state,
    stage: params.stage || null,
    detail: params.detail || {},
    actor: params.actor || "system:fulfillment",
  });
}

export async function ensureFulfillmentJob(input: EnsureFulfillmentJobInput) {
  const idempotencyKey = buildFulfillmentIdempotencyKey(input.subscriptionId);
  const correlationId = buildFulfillmentCorrelationId();

  const { data: existing, error: existingError } = await db
    .from("onboarding_jobs")
    .select("id,state")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing?.id) {
    return {
      onboardingJobId: String(existing.id),
      state: String(existing.state) as FulfillmentState,
      idempotencyKey,
    };
  }

  const insertPayload = {
    user_id: input.userId,
    subscription_id: input.subscriptionId,
    customer_id: input.customerId,
    idempotency_key: idempotencyKey,
    request_id: correlationId,
    correlation_id: correlationId,
    state: "payment_confirmed",
    payload: {
      source: "airwallex_webhook",
      customerId: input.customerId,
      subscriptionId: input.subscriptionId,
    },
    contract_version: input.snapshot.contractVersion,
    tenant_profile: input.snapshot.tenantProfile,
    sku_codes: input.snapshot.skuCodes,
    package_ids: input.snapshot.packageIds,
    package_versions: input.snapshot.packageVersions,
    request_payload: {},
    response_payload: {},
    payment_event_id: input.paymentEventId || null,
    created_by: "system:webhook",
    updated_by: "system:webhook",
    last_action: "enqueue_fulfillment",
    last_action_at: new Date().toISOString(),
  };

  const { data: created, error } = await db.from("onboarding_jobs").insert(insertPayload).select("id,state").single();

  if (error || !created?.id) {
    throw new Error(error?.message || "Failed to ensure fulfillment job");
  }

  await recordJobEvent({
    onboardingJobId: String(created.id),
    state: "payment_confirmed",
    stage: "enqueue",
    detail: {
      subscriptionId: input.subscriptionId,
      customerId: input.customerId,
      idempotencyKey,
    },
    actor: "system:webhook",
  }).catch(() => undefined);

  return {
    onboardingJobId: String(created.id),
    state: String(created.state) as FulfillmentState,
    idempotencyKey,
  };
}

async function updateJobState(params: {
  onboardingJobId: string;
  nextState: FulfillmentState;
  actor: string;
  stage?: string;
  requestPayload?: Record<string, unknown>;
  responsePayload?: Record<string, unknown>;
  errorCode?: string | null;
  errorMessage?: string | null;
  nextRetryAt?: string | null;
}) {
  const patch: Record<string, unknown> = {
    state: params.nextState,
    updated_at: new Date().toISOString(),
    updated_by: params.actor,
    last_action: params.stage || "transition",
    last_action_at: new Date().toISOString(),
    error_code: params.errorCode ?? null,
    error_message: params.errorMessage ?? null,
    error_stage: params.errorCode ? params.stage || null : null,
  };

  if (params.requestPayload) patch.request_payload = params.requestPayload;
  if (params.responsePayload) patch.response_payload = params.responsePayload;
  if (params.nextRetryAt !== undefined) patch.next_retry_at = params.nextRetryAt;

  const { error } = await db.from("onboarding_jobs").update(patch).eq("id", params.onboardingJobId);
  if (error) throw new Error(error.message);

  await recordJobEvent({
    onboardingJobId: params.onboardingJobId,
    state: params.nextState,
    stage: params.stage,
    detail: {
      errorCode: params.errorCode || null,
      errorMessage: params.errorMessage || null,
    },
    actor: params.actor,
  }).catch(() => undefined);
}

async function incrementRetryCount(onboardingJobId: string) {
  const { data, error } = await db
    .from("onboarding_jobs")
    .select("retry_count")
    .eq("id", onboardingJobId)
    .single();
  if (error) throw new Error(error.message);

  const nextRetryCount = Number(data.retry_count || 0) + 1;
  const delayMinutes = Math.min(30, Math.max(1, nextRetryCount * 2));
  const nextRetryAt = new Date(Date.now() + delayMinutes * 60_000).toISOString();

  const { error: updateError } = await db
    .from("onboarding_jobs")
    .update({ retry_count: nextRetryCount, next_retry_at: nextRetryAt, updated_at: new Date().toISOString() })
    .eq("id", onboardingJobId);

  if (updateError) throw new Error(updateError.message);

  return { nextRetryCount, nextRetryAt };
}

async function resolveProvisionMode(customerId: string): Promise<"assign_existing" | "create_new"> {
  const { data, error } = await db
    .from("customer_tenant_mappings")
    .select("id")
    .eq("customer_id", customerId)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.id ? "assign_existing" : "create_new";
}

function normalizeControlError(payload: Record<string, unknown>, status: number) {
  const nestedError =
    (payload.responsePayload && typeof payload.responsePayload === "object"
      ? (payload.responsePayload as Record<string, unknown>).error
      : null) ||
    (payload.response_payload && typeof payload.response_payload === "object"
      ? (payload.response_payload as Record<string, unknown>).error
      : null);
  const nestedErrorCode =
    (payload.responsePayload && typeof payload.responsePayload === "object"
      ? (payload.responsePayload as Record<string, unknown>).error_code
      : null) ||
    (payload.response_payload && typeof payload.response_payload === "object"
      ? (payload.response_payload as Record<string, unknown>).error_code
      : null);
  const code =
    (typeof payload.errorCode === "string" && payload.errorCode) ||
    (typeof payload.error_code === "string" && payload.error_code) ||
    (typeof payload.code === "string" && payload.code) ||
    (typeof nestedErrorCode === "string" && nestedErrorCode) ||
    (typeof nestedError === "string" && nestedError) ||
    (typeof payload.error === "string" && payload.error) ||
    "NEXIUS_CONTROL_ONBOARDING_HTTP_ERROR";

  const message =
    (typeof payload.message === "string" && payload.message) ||
    (typeof payload.errorMessage === "string" && payload.errorMessage) ||
    `Control plane onboarding failed (${status})`;

  return { code, message };
}

async function dispatchToControl(params: {
  onboardingJobId: string;
  idempotencyKey: string;
  correlationId: string;
  payload: Record<string, unknown>;
}) {
  const cfg = controlConfig();
  if (!cfg.endpoint || !cfg.token) {
    return {
      ok: false,
      status: 503,
      body: { errorCode: "CONTROL_NOT_CONFIGURED", message: "Missing control endpoint/token configuration" },
    };
  }

  const timeoutMs = Number(process.env.NEXIUS_CONTROL_ONBOARDING_TIMEOUT_MS || 60_000);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(cfg.endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${cfg.token}`,
        "Idempotency-Key": params.idempotencyKey,
        "X-Request-Id": params.correlationId,
        "X-Onboarding-Job-Id": params.onboardingJobId,
      },
      body: JSON.stringify(params.payload),
      signal: controller.signal,
    });

    const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    return { ok: response.ok, status: response.status, body };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      status: 0,
      body: {
        errorCode: "NEXIUS_CONTROL_ONBOARDING_NETWORK_ERROR",
        message,
      },
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function processFulfillmentJobs(limit = 10) {
  const nowMs = Date.now();
  const { data: jobs, error } = await db
    .from("onboarding_jobs")
    .select(
      "id,user_id,subscription_id,customer_id,idempotency_key,correlation_id,state,contract_version,tenant_profile,sku_codes,package_ids,package_versions,retry_count,next_retry_at"
    )
    .in("state", ["payment_confirmed", "package_resolved", "failed"])
    .order("updated_at", { ascending: true })
    .limit(limit * 3);

  if (error) throw new Error(error.message);

  const results: Array<{ onboardingJobId: string; state: string; errorCode?: string }> = [];

  for (const job of jobs || []) {
    if (results.length >= limit) break;

    const nextRetryAt = job.next_retry_at ? Date.parse(String(job.next_retry_at)) : null;
    if (nextRetryAt && Number.isFinite(nextRetryAt) && nextRetryAt > nowMs) {
      continue;
    }

    const onboardingJobId = String(job.id);
    const currentState = String(job.state) as FulfillmentState;

    if (TERMINAL_STATES.has(currentState)) continue;
    if (RETRYABLE_FAILURE_STATES.has(currentState) && Number(job.retry_count || 0) >= 10) {
      results.push({ onboardingJobId, state: currentState, errorCode: "RETRY_LIMIT_EXCEEDED" });
      continue;
    }

    try {
      const provisionMode = await resolveProvisionMode(String(job.customer_id));

      await updateJobState({
        onboardingJobId,
        nextState: "package_resolved",
        actor: "system:fulfillment_worker",
        stage: "package_resolved",
      });

      const requestPayload = {
        contractVersion: String(job.contract_version || "v2"),
        customerId: String(job.customer_id),
        fullName: `Customer ${String(job.customer_id)}`,
        subscriptionId: String(job.subscription_id),
        roleIds: await roleIdsForSubscription(String(job.subscription_id)),
        tenantProfile: "runtime_plus_ui_supabase",
        provisionMode,
        packageIds: Array.isArray(job.package_ids) ? job.package_ids.map((value: unknown) => String(value)) : [],
        packageVersions: Array.isArray(job.package_versions)
          ? job.package_versions.map((value: unknown) => String(value))
          : [],
      };

      await updateJobState({
        onboardingJobId,
        nextState: "tenant_request_sent",
        actor: "system:fulfillment_worker",
        stage: "tenant_request_sent",
        requestPayload,
      });

      const dispatch = await dispatchToControl({
        onboardingJobId,
        idempotencyKey: String(job.idempotency_key || buildFulfillmentIdempotencyKey(String(job.subscription_id))),
        correlationId: String(job.correlation_id || buildFulfillmentCorrelationId()),
        payload: requestPayload,
      });

      if (!dispatch.ok) {
        const err = normalizeControlError(dispatch.body, dispatch.status);
        const strictErrorCodes = new Set(["TENANT_ASSIGNMENT_NOT_FOUND", "TENANT_ALREADY_ASSIGNED"]);

        const nextState: FulfillmentState = "failed";
        await updateJobState({
          onboardingJobId,
          nextState,
          actor: "system:fulfillment_worker",
          stage: "control_dispatch",
          requestPayload,
          responsePayload: dispatch.body,
          errorCode: err.code,
          errorMessage: err.message,
        });

        if (!strictErrorCodes.has(err.code)) {
          await incrementRetryCount(onboardingJobId);
        }

        results.push({ onboardingJobId, state: nextState, errorCode: err.code });
        continue;
      }

      const controlState = String(dispatch.body.state || dispatch.body.status || "in_progress").toLowerCase();
      const nextState: FulfillmentState = controlState === "completed" ? "completed" : "in_progress";

      await updateJobState({
        onboardingJobId,
        nextState,
        actor: "system:fulfillment_worker",
        stage: "control_response",
        requestPayload,
        responsePayload: dispatch.body,
      });

      results.push({ onboardingJobId, state: nextState });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await updateJobState({
        onboardingJobId,
        nextState: "failed",
        actor: "system:fulfillment_worker",
        stage: "worker_exception",
        errorCode: "FULFILLMENT_WORKER_ERROR",
        errorMessage: message,
      }).catch(() => undefined);

      await incrementRetryCount(onboardingJobId).catch(() => undefined);

      results.push({ onboardingJobId, state: "failed", errorCode: "FULFILLMENT_WORKER_ERROR" });
    }
  }

  return {
    processed: results.length,
    results,
  };
}

export async function controlPackageRetry(params: {
  payload: Record<string, unknown>;
  retryFromStep: string;
  idempotencyKey?: string;
}) {
  const cfg = controlConfig();
  if (!cfg.endpoint || !cfg.token) {
    throw new Error("Missing control endpoint/token configuration");
  }
  const base = controlBaseFromEndpoint(cfg.endpoint);
  const url = `${base}/v1/tenants/onboard/packages/retry`;
  const timeoutMs = Number(process.env.NEXIUS_CONTROL_ONBOARDING_TIMEOUT_MS || 60_000);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${cfg.token}`,
      },
      body: JSON.stringify({
        payload: params.payload,
        retryFromStep: params.retryFromStep,
        idempotencyKey: params.idempotencyKey || null,
      }),
      signal: controller.signal,
    });
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      const normalized = normalizeControlError(body, res.status);
      throw new Error(`${normalized.code}: ${normalized.message}`);
    }
    return body;
  } finally {
    clearTimeout(timeout);
  }
}

export async function controlPackageRollback(params: { customerId: string; packageId: string }) {
  const cfg = controlConfig();
  if (!cfg.endpoint || !cfg.token) {
    throw new Error("Missing control endpoint/token configuration");
  }
  const base = controlBaseFromEndpoint(cfg.endpoint);
  const url = `${base}/v1/tenants/onboard/packages/rollback`;
  const timeoutMs = Number(process.env.NEXIUS_CONTROL_ONBOARDING_TIMEOUT_MS || 60_000);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${cfg.token}`,
      },
      body: JSON.stringify({
        customerId: params.customerId,
        packageId: params.packageId,
      }),
      signal: controller.signal,
    });
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      const normalized = normalizeControlError(body, res.status);
      throw new Error(`${normalized.code}: ${normalized.message}`);
    }
    return body;
  } finally {
    clearTimeout(timeout);
  }
}

async function roleIdsForSubscription(subscriptionId: string): Promise<string[]> {
  const { data, error } = await db
    .from("subscriptions")
    .select("role_ids")
    .eq("id", subscriptionId)
    .single();

  if (error) throw new Error(error.message);
  return Array.isArray(data.role_ids) ? data.role_ids.map((value: unknown) => String(value)) : [];
}

export async function reconcileEntitlementsForSubscription(params: {
  subscriptionId: string;
  userId: string;
  customerId: string;
  snapshot: PurchaseSnapshot;
}) {
  await ensureCustomerEntitlements({
    userId: params.userId,
    subscriptionId: params.subscriptionId,
    customerId: params.customerId,
    roleIds: params.snapshot.roleIds,
    packageIds: params.snapshot.packageIds,
    packageVersions: params.snapshot.packageVersions,
    contractVersion: params.snapshot.contractVersion,
    actor: "system:fulfillment_reconcile",
  });
}
