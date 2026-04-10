import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  buildFulfillmentCorrelationId,
  buildFulfillmentIdempotencyKey,
  type PackageSourceSnapshotEntry,
  type PurchaseSnapshot,
} from "@/lib/purchase-snapshot";
import { ensureCustomerEntitlements } from "@/lib/entitlements";

const db = supabaseAdmin.schema("nexius_os");

const TERMINAL_STATES = new Set(["completed"]);
const RETRYABLE_FAILURE_STATES = new Set(["failed"]);
const STRICT_ERROR_CODES = new Set(["TENANT_ASSIGNMENT_NOT_FOUND", "TENANT_ALREADY_ASSIGNED"]);

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

export type ControlDispatchResponse = {
  ok: boolean;
  status: number;
  body: Record<string, unknown>;
};

export type ControlDispatchAttemptLog = {
  attemptLabel: "create_new" | "assign_existing";
  provisionMode: "create_new" | "assign_existing";
  idempotencyKey: string;
  correlationId: string;
  httpStatus: number;
  requestId: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  transportAttempts: number;
  responseBody: Record<string, unknown>;
  payload: Record<string, unknown>;
};

function parseControlState(payload: Record<string, unknown>) {
  const state = String(payload.state || payload.status || "").trim().toLowerCase();
  const workflowState = String(payload.workflow_state || payload.workflowStatus || "").trim().toLowerCase();
  const combined = [state, workflowState].filter(Boolean);

  if (combined.includes("completed") || combined.includes("complete") || combined.includes("succeeded") || combined.includes("success")) {
    return "completed" as const;
  }
  if (combined.includes("failed") || combined.includes("error")) {
    return "failed" as const;
  }
  return "in_progress" as const;
}

function extractTenantId(payload: Record<string, unknown>) {
  const candidates = [
    payload.tenant_id,
    payload.tenantId,
    payload.workspace_id,
    payload.workspaceId,
    payload.runtime_container,
    payload.runtimeContainer,
  ];
  const value = candidates.find((candidate) => typeof candidate === "string" && candidate.trim());
  return typeof value === "string" ? value.trim() : null;
}

function controlConfig() {
  const token = (process.env.NEXIUS_CONTROL_ONBOARDING_TOKEN || "").trim();

  const explicitEndpoint = (process.env.NEXIUS_CONTROL_ONBOARDING_URL || "").trim();
  const baseUrl = (process.env.NEXIUS_CONTROL_BASE_URL || "").trim();
  const endpoint = explicitEndpoint || (baseUrl ? `${baseUrl.replace(/\/$/, "")}/v1/tenants/onboard` : "");

  return { endpoint, token };
}

export function validateControlEnv() {
  const explicitEndpoint = (process.env.NEXIUS_CONTROL_ONBOARDING_URL || "").trim();
  const baseUrl = (process.env.NEXIUS_CONTROL_BASE_URL || "").trim();
  const token = (process.env.NEXIUS_CONTROL_ONBOARDING_TOKEN || "").trim();

  const missing: string[] = [];
  if (!explicitEndpoint && !baseUrl) {
    missing.push("NEXIUS_CONTROL_BASE_URL or NEXIUS_CONTROL_ONBOARDING_URL");
  }
  if (!token) {
    missing.push("NEXIUS_CONTROL_ONBOARDING_TOKEN");
  }

  return {
    ok: missing.length === 0,
    missing,
  };
}

function controlBaseFromEndpoint(endpoint: string) {
  const trimmed = endpoint.trim();
  if (!trimmed) return "";
  if (trimmed.endsWith("/v1/tenants/onboard")) return trimmed.slice(0, -"/v1/tenants/onboard".length);
  return trimmed.replace(/\/$/, "");
}

function normalizeSubscriptionForKey(subscriptionId: string) {
  return subscriptionId.replace(/[^a-zA-Z0-9_-]/g, "");
}

export function buildAssignExistingIdempotencyKey(subscriptionId: string) {
  return `fulfill-sub-${normalizeSubscriptionForKey(subscriptionId)}-assign`;
}

function controlTimeoutMs() {
  return Math.max(1_000, Number(process.env.NEXIUS_CONTROL_ONBOARDING_TIMEOUT_MS || 60_000));
}

function controlDispatchMaxAttempts() {
  return Math.min(5, Math.max(1, Number(process.env.NEXIUS_CONTROL_DISPATCH_MAX_ATTEMPTS || 2)));
}

function controlDispatchBackoffMs() {
  return Math.min(10_000, Math.max(100, Number(process.env.NEXIUS_CONTROL_DISPATCH_BACKOFF_MS || 500)));
}

function isAbortLikeMessage(message: string) {
  const lower = message.toLowerCase();
  return lower.includes("aborted") || lower.includes("abort") || lower.includes("timeout");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
      packageSources: input.snapshot.packageSources,
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

  const timeoutMs = controlTimeoutMs();
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
    const timedOut = isAbortLikeMessage(message);
    return {
      ok: false,
      status: 0,
      body: {
        errorCode: timedOut ? "NEXIUS_CONTROL_ONBOARDING_TIMEOUT" : "NEXIUS_CONTROL_ONBOARDING_NETWORK_ERROR",
        message,
        timeoutMs,
      },
    };
  } finally {
    clearTimeout(timeout);
  }
}

function isRetryableTransportFailure(status: number, code: string) {
  return status === 0 || code === "NEXIUS_CONTROL_ONBOARDING_NETWORK_ERROR" || code === "NEXIUS_CONTROL_ONBOARDING_TIMEOUT";
}

async function dispatchWithRetryGuard(params: {
  onboardingJobId: string;
  idempotencyKey: string;
  correlationId: string;
  payload: Record<string, unknown>;
}) {
  const maxAttempts = controlDispatchMaxAttempts();
  let lastResponse: ControlDispatchResponse = {
    ok: false,
    status: 0,
    body: { errorCode: "NEXIUS_CONTROL_ONBOARDING_NETWORK_ERROR", message: "No dispatch attempts executed" },
  };

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await dispatchToControl(params);
    lastResponse = response;
    const normalized = normalizeControlError(response.body, response.status);
    const retryable = !response.ok && isRetryableTransportFailure(response.status, normalized.code);

    if (!retryable || attempt >= maxAttempts) {
      return {
        response,
        transportAttempts: attempt,
      };
    }

    await sleep(controlDispatchBackoffMs());
  }

  return {
    response: lastResponse,
    transportAttempts: maxAttempts,
  };
}

function controlRequestIdFromBody(body: Record<string, unknown>) {
  return typeof body.request_id === "string"
    ? body.request_id
    : typeof body.requestId === "string"
      ? body.requestId
      : null;
}

export async function dispatchControlWithAssignFallback(params: {
  onboardingJobId: string;
  subscriptionId: string;
  correlationId: string;
  baseIdempotencyKey: string;
  initialProvisionMode: "create_new" | "assign_existing";
  requestPayload: Record<string, unknown>;
  dispatchFn?: (args: {
    onboardingJobId: string;
    idempotencyKey: string;
    correlationId: string;
    payload: Record<string, unknown>;
  }) => Promise<{ response: ControlDispatchResponse; transportAttempts: number }>;
}) {
  const dispatchFn = params.dispatchFn || dispatchWithRetryGuard;
  const attempts: ControlDispatchAttemptLog[] = [];

  const createPayload = { ...params.requestPayload, provisionMode: params.initialProvisionMode };
  const assignPayload = { ...params.requestPayload, provisionMode: "assign_existing" };
  const initialLabel: "create_new" | "assign_existing" = params.initialProvisionMode;
  const attemptPlan: Array<{ label: "create_new" | "assign_existing"; payload: Record<string, unknown>; idempotencyKey: string }> = [
    {
      label: initialLabel,
      payload: createPayload,
      idempotencyKey: params.baseIdempotencyKey,
    },
  ];

  for (const attempt of attemptPlan) {
    const { response, transportAttempts } = await dispatchFn({
      onboardingJobId: params.onboardingJobId,
      idempotencyKey: attempt.idempotencyKey,
      correlationId: params.correlationId,
      payload: attempt.payload,
    });
    const normalized = normalizeControlError(response.body, response.status);
    const attemptLog: ControlDispatchAttemptLog = {
      attemptLabel: attempt.label,
      provisionMode: attempt.label,
      idempotencyKey: attempt.idempotencyKey,
      correlationId: params.correlationId,
      httpStatus: response.status,
      requestId: controlRequestIdFromBody(response.body),
      errorCode: response.ok ? null : normalized.code,
      errorMessage: response.ok ? null : normalized.message,
      transportAttempts,
      responseBody: response.body,
      payload: attempt.payload,
    };
    attempts.push(attemptLog);

    if (response.ok) {
      return {
        final: attemptLog,
        attempts,
        fallbackUsed: attempt.label === "assign_existing",
      };
    }

    const shouldFallback =
      attempt.label === "create_new" &&
      normalized.code === "TENANT_ALREADY_ASSIGNED";

    if (shouldFallback) {
      attemptPlan.push({
        label: "assign_existing",
        payload: assignPayload,
        idempotencyKey: buildAssignExistingIdempotencyKey(params.subscriptionId),
      });
    }
  }

  return {
    final: attempts[attempts.length - 1],
    attempts,
    fallbackUsed: attempts.some((attempt) => attempt.attemptLabel === "assign_existing"),
  };
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
    const result = await processFulfillmentJob(job as Record<string, unknown>, nowMs);
    if (result) results.push(result);
  }

  return {
    processed: results.length,
    results,
  };
}

async function processFulfillmentJob(job: Record<string, unknown>, nowMs = Date.now()) {
  const nextRetryAt = job.next_retry_at ? Date.parse(String(job.next_retry_at)) : null;
  if (nextRetryAt && Number.isFinite(nextRetryAt) && nextRetryAt > nowMs) {
    return null;
  }

  const onboardingJobId = String(job.id);
  const currentState = String(job.state) as FulfillmentState;

  if (TERMINAL_STATES.has(currentState)) return null;
  if (RETRYABLE_FAILURE_STATES.has(currentState) && Number(job.retry_count || 0) >= 10) {
    return { onboardingJobId, state: currentState, errorCode: "RETRY_LIMIT_EXCEEDED" };
  }

  try {
    const provisionMode = await resolveProvisionMode(String(job.customer_id));

    await updateJobState({
      onboardingJobId,
      nextState: "package_resolved",
      actor: "system:fulfillment_worker",
      stage: "package_resolved",
    });

    const packageIds = Array.isArray(job.package_ids) ? job.package_ids.map((value: unknown) => String(value)) : [];
    const packageVersions = Array.isArray(job.package_versions)
      ? job.package_versions.map((value: unknown) => String(value))
      : [];
    const packageSources = await packageSourcesForSubscription(String(job.subscription_id));
    const requestPayloadBase = {
      contractVersion: String(job.contract_version || "v2"),
      customerId: String(job.customer_id),
      fullName: `Customer ${String(job.customer_id)}`,
      subscriptionId: String(job.subscription_id),
      roleIds: await roleIdsForSubscription(String(job.subscription_id)),
      tenantProfile: "runtime_plus_ui_supabase",
      packageIds,
      packageVersions,
      packageSources,
      packages: buildControlPackages({ packageIds, packageVersions, packageSources }),
    };
    const requestPayload = {
      ...requestPayloadBase,
      provisionMode,
    };

    await updateJobState({
      onboardingJobId,
      nextState: "tenant_request_sent",
      actor: "system:fulfillment_worker",
      stage: "tenant_request_sent",
      requestPayload,
    });

    const dispatchResult = await dispatchControlWithAssignFallback({
      onboardingJobId,
      subscriptionId: String(job.subscription_id),
      baseIdempotencyKey: String(job.idempotency_key || buildFulfillmentIdempotencyKey(String(job.subscription_id))),
      correlationId: String(job.correlation_id || buildFulfillmentCorrelationId()),
      initialProvisionMode: provisionMode,
      requestPayload: requestPayloadBase,
    });
    const dispatchAttempts = dispatchResult.attempts;
    const finalAttempt = dispatchResult.final;
    const finalDispatch: ControlDispatchResponse = {
      ok: !finalAttempt.errorCode,
      status: finalAttempt.httpStatus,
      body: finalAttempt.responseBody || {},
    };

    for (const attemptLog of dispatchAttempts) {
      await recordJobEvent({
        onboardingJobId,
        state: "tenant_request_sent",
        stage: "control_dispatch_attempt",
        detail: {
          attemptLabel: attemptLog.attemptLabel,
          provisionMode: attemptLog.provisionMode,
          idempotencyKey: attemptLog.idempotencyKey,
          correlationId: attemptLog.correlationId,
          request_id: attemptLog.requestId,
          http_status: attemptLog.httpStatus,
          error_code: attemptLog.errorCode,
          error_message: attemptLog.errorMessage,
          transportAttempts: attemptLog.transportAttempts,
        },
        actor: "system:fulfillment_worker",
      }).catch(() => undefined);
    }

    if (!finalDispatch.ok) {
      const err = normalizeControlError(finalDispatch.body, finalDispatch.status);
      const nextState: FulfillmentState = "failed";
      await updateJobState({
        onboardingJobId,
        nextState,
        actor: "system:fulfillment_worker",
        stage: "control_dispatch",
        requestPayload: finalAttempt.payload,
        responsePayload: {
          ...(finalDispatch.body || {}),
          controlDispatch: {
            attempts: dispatchAttempts.map((attempt) => ({
              attemptLabel: attempt.attemptLabel,
              provisionMode: attempt.provisionMode,
              idempotencyKey: attempt.idempotencyKey,
              request_id: attempt.requestId,
              http_status: attempt.httpStatus,
              error_code: attempt.errorCode,
              error_message: attempt.errorMessage,
              transportAttempts: attempt.transportAttempts,
            })),
          },
        },
        errorCode: err.code,
        errorMessage: err.message,
      });

      if (!STRICT_ERROR_CODES.has(err.code)) {
        await incrementRetryCount(onboardingJobId);
      }

      return { onboardingJobId, state: nextState, errorCode: err.code };
    }

    const nextState: FulfillmentState = parseControlState(finalDispatch.body);

    await updateJobState({
      onboardingJobId,
      nextState,
      actor: "system:fulfillment_worker",
      stage: "control_response",
      requestPayload: finalAttempt.payload,
      responsePayload: {
        ...(finalDispatch.body || {}),
        controlDispatch: {
          attempts: dispatchAttempts.map((attempt) => ({
            attemptLabel: attempt.attemptLabel,
            provisionMode: attempt.provisionMode,
            idempotencyKey: attempt.idempotencyKey,
            request_id: attempt.requestId,
            http_status: attempt.httpStatus,
            error_code: attempt.errorCode,
            error_message: attempt.errorMessage,
            transportAttempts: attempt.transportAttempts,
          })),
        },
      },
    });

    return { onboardingJobId, state: nextState };
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

    return { onboardingJobId, state: "failed", errorCode: "FULFILLMENT_WORKER_ERROR" };
  }
}

export async function processFulfillmentJobById(onboardingJobId: string) {
  const { data, error } = await db
    .from("onboarding_jobs")
    .select(
      "id,user_id,subscription_id,customer_id,idempotency_key,correlation_id,state,contract_version,tenant_profile,sku_codes,package_ids,package_versions,retry_count,next_retry_at"
    )
    .eq("id", onboardingJobId)
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Onboarding job not found");
  }

  const result = await processFulfillmentJob(data as Record<string, unknown>);
  return result || { onboardingJobId, state: String(data.state || "payment_confirmed") };
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
  const timeoutMs = controlTimeoutMs();
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
  const timeoutMs = controlTimeoutMs();
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

async function packageSourcesForSubscription(subscriptionId: string): Promise<PackageSourceSnapshotEntry[]> {
  const { data, error } = await db
    .from("subscriptions")
    .select("purchase_snapshot")
    .eq("id", subscriptionId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  const snapshot =
    data?.purchase_snapshot && typeof data.purchase_snapshot === "object"
      ? (data.purchase_snapshot as Record<string, unknown>)
      : {};
  if (!Array.isArray(snapshot.packageSources)) return [];

  return snapshot.packageSources
    .filter((value) => !!value && typeof value === "object")
    .map((value) => {
      const item = value as Record<string, unknown>;
      return {
        packageId: String(item.packageId || ""),
        owner: String(item.owner || ""),
        repo: String(item.repo || ""),
        ref: String(item.ref || ""),
        subdir: item.subdir ? String(item.subdir) : null,
      };
    })
    .filter((item) => item.packageId && item.owner && item.repo && item.ref);
}

export function buildControlPackages(params: {
  packageIds: string[];
  packageVersions: string[];
  packageSources: PackageSourceSnapshotEntry[];
}) {
  const sourceByPackageId = new Map<string, PackageSourceSnapshotEntry>();
  for (const source of params.packageSources) {
    if (!sourceByPackageId.has(source.packageId)) {
      sourceByPackageId.set(source.packageId, source);
    }
  }
  return params.packageIds.map((packageId, idx) => {
    const source = sourceByPackageId.get(packageId);
    return {
      packageId,
      version: params.packageVersions[idx] || params.packageVersions[0] || null,
      source: {
        owner: source?.owner || null,
        repo: source?.repo || null,
        ref: source?.ref || null,
        subdir: source?.subdir || null,
      },
    };
  });
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

export async function reconcileStuckInProgressJobs(limit = 10) {
  const staleMinutes = Math.min(1_440, Math.max(1, Number(process.env.FULFILLMENT_STUCK_JOB_MINUTES || 30)));
  const thresholdIso = new Date(Date.now() - staleMinutes * 60_000).toISOString();

  const { data, error } = await db
    .from("onboarding_jobs")
    .select("id,state,retry_count,updated_at")
    .in("state", ["in_progress", "tenant_request_sent"])
    .lt("updated_at", thresholdIso)
    .order("updated_at", { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);

  const reconciled: Array<{ onboardingJobId: string; previousState: string; nextState: string }> = [];

  for (const row of data || []) {
    const onboardingJobId = String(row.id);
    const previousState = String(row.state || "in_progress");
    await updateJobState({
      onboardingJobId,
      nextState: "failed",
      actor: "system:stuck_reconcile",
      stage: "stuck_reconcile",
      errorCode: "CONTROL_DISPATCH_STUCK_TIMEOUT",
      errorMessage: `Job exceeded ${staleMinutes} minutes in ${previousState}`,
      responsePayload: {
        stuckThresholdMinutes: staleMinutes,
        reconciledAt: new Date().toISOString(),
      },
    });

    await incrementRetryCount(onboardingJobId).catch(() => undefined);
    reconciled.push({ onboardingJobId, previousState, nextState: "failed" });
  }

  return {
    processed: reconciled.length,
    staleMinutes,
    reconciled,
  };
}

export async function syncOnboardingJobFromControl(params: {
  onboardingJobId?: string;
  customerId?: string;
  requestId?: string;
  responsePayload: Record<string, unknown>;
  actor?: string;
}) {
  let query = db
    .from("onboarding_jobs")
    .select("id,customer_id,request_id,state")
    .order("updated_at", { ascending: false })
    .limit(1);

  if (params.onboardingJobId) {
    query = query.eq("id", params.onboardingJobId);
  } else if (params.requestId) {
    query = query.eq("request_id", params.requestId);
  } else if (params.customerId) {
    query = query.eq("customer_id", params.customerId);
  } else {
    throw new Error("onboardingJobId, requestId, or customerId is required");
  }

  const { data: job, error } = await query.maybeSingle();
  if (error) throw new Error(error.message);
  if (!job?.id) throw new Error("Onboarding job not found");

  const actor = params.actor || "system:control_callback";
  const nextState = parseControlState(params.responsePayload);
  const errorCode =
    nextState === "failed"
      ? String(params.responsePayload.error_code || params.responsePayload.errorCode || "NEXIUS_CONTROL_ONBOARDING_FAILED")
      : null;
  const errorMessage =
    nextState === "failed"
      ? String(params.responsePayload.error_message || params.responsePayload.errorMessage || params.responsePayload.message || "Control onboarding failed")
      : null;

  await updateJobState({
    onboardingJobId: String(job.id),
    nextState,
    actor,
    stage: "control_reconcile",
    responsePayload: params.responsePayload,
    errorCode,
    errorMessage,
    nextRetryAt: nextState === "completed" ? null : undefined,
  });

  if (nextState === "completed") {
    const tenantId = extractTenantId(params.responsePayload);
    if (tenantId) {
      const customerId =
        String(params.responsePayload.customer_id || params.responsePayload.customerId || job.customer_id || params.customerId || "").trim();
      if (customerId) {
        const now = new Date().toISOString();
        const { error: mappingError } = await db.from("customer_tenant_mappings").upsert(
          {
            customer_id: customerId,
            tenant_id: tenantId,
            status: "active",
            updated_at: now,
            updated_by: actor,
            last_action: "control_reconcile_completed",
            last_action_at: now,
            created_by: actor,
          },
          { onConflict: "customer_id" }
        );
        if (mappingError) throw new Error(mappingError.message);
      }
    }
  }

  return {
    onboardingJobId: String(job.id),
    customerId: String(job.customer_id || params.customerId || ""),
    requestId: String(job.request_id || params.requestId || ""),
    state: nextState,
  };
}
