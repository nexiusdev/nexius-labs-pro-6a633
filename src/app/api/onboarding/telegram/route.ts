import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { ensureFulfillmentJob } from "@/lib/fulfillment";
import { buildPurchaseSnapshot } from "@/lib/purchase-snapshot";
import { mapStatus } from "@/lib/portal-data";

const db = supabaseAdmin.schema("nexius_os");

function isIncompleteSnapshot(snapshot: {
  packageIds?: unknown[];
  packageSources?: unknown[];
  roleIds?: unknown[];
}) {
  const packageIds = Array.isArray(snapshot.packageIds) ? snapshot.packageIds : [];
  const packageSources = Array.isArray(snapshot.packageSources) ? snapshot.packageSources : [];
  const roleIds = Array.isArray(snapshot.roleIds) ? snapshot.roleIds : [];
  return roleIds.length > 0 && (packageIds.length === 0 || packageSources.length === 0);
}

async function loadSubscription(subscriptionId: string) {
  const { data, error } = await db
    .from("subscriptions")
    .select(
      "id,user_id,status,role_ids,sku_codes,package_ids,package_versions,purchase_snapshot,contract_version,tenant_profile"
    )
    .eq("id", subscriptionId)
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Subscription not found");
  }

  return data;
}

async function loadLatestJob(subscriptionId: string) {
  const { data, error } = await db
    .from("onboarding_jobs")
    .select(
      "id,customer_id,state,idempotency_key,request_id,error_code,error_message,request_payload,response_payload,retry_count,error_stage,updated_at"
    )
    .eq("subscription_id", subscriptionId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

async function loadJobEvents(onboardingJobId: string) {
  const { data, error } = await db
    .from("onboarding_job_events")
    .select("state,stage,detail,created_at")
    .eq("onboarding_job_id", onboardingJobId)
    .order("created_at", { ascending: true })
    .limit(30);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const subscriptionId = (req.nextUrl.searchParams.get("subscriptionId") || "").trim();
  if (!subscriptionId) {
    return NextResponse.json({ ok: false, error: "subscriptionId is required" }, { status: 400 });
  }

  const subscription = await loadSubscription(subscriptionId).catch(() => null);
  if (!subscription) return NextResponse.json({ ok: false, error: "Subscription not found" }, { status: 404 });
  if (String(subscription.user_id) !== userId) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const job = await loadLatestJob(subscriptionId);
  if (!job?.id) {
    return NextResponse.json({ ok: true, onboardingJob: null, timeline: [] });
  }

  const timeline = await loadJobEvents(String(job.id));

  return NextResponse.json({
    ok: true,
    onboardingJob: {
      id: String(job.id),
      customerId: String(job.customer_id || ""),
      state: String(job.state || ""),
      activationState: mapStatus(String(job.state || "")),
      idempotencyKey: String(job.idempotency_key || ""),
      requestId: String(job.request_id || ""),
      errorCode: job.error_code ? String(job.error_code) : null,
      errorMessage: job.error_message ? String(job.error_message) : null,
      retryCount: Number(job.retry_count || 0),
      errorStage: job.error_stage ? String(job.error_stage) : null,
      requestPayload: job.request_payload || {},
      responsePayload: job.response_payload || {},
      updatedAt: job.updated_at ? String(job.updated_at) : null,
    },
    timeline: timeline.map((item) => ({
      state: String(item.state || ""),
      stage: item.stage ? String(item.stage) : null,
      detail: item.detail && typeof item.detail === "object" ? item.detail : {},
      createdAt: item.created_at ? String(item.created_at) : null,
    })),
  });
}

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    subscriptionId?: unknown;
    retry?: unknown;
  };

  const subscriptionId = String(body.subscriptionId || "").trim();
  const retry = body.retry === true;

  if (!subscriptionId) {
    return NextResponse.json({ ok: false, error: "subscriptionId is required" }, { status: 400 });
  }

  const subscription = await loadSubscription(subscriptionId).catch(() => null);
  if (!subscription) return NextResponse.json({ ok: false, error: "Subscription not found" }, { status: 404 });
  if (String(subscription.user_id) !== userId) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  if (String(subscription.status) !== "active") {
    return NextResponse.json({ ok: false, error: "Subscription must be active before fulfillment" }, { status: 409 });
  }

  let snapshot = subscription.purchase_snapshot && typeof subscription.purchase_snapshot === "object"
    ? (subscription.purchase_snapshot as {
      contractVersion?: string;
      tenantProfile?: string;
      skuCodes?: unknown[];
      packageIds?: unknown[];
      packageVersions?: unknown[];
      packageSources?: unknown[];
      roleIds?: unknown[];
      capturedAt?: string;
    })
    : await buildPurchaseSnapshot({
      roleIds: Array.isArray(subscription.role_ids)
        ? subscription.role_ids.map((value: unknown) => String(value))
        : [],
      skuCodes: Array.isArray(subscription.sku_codes)
        ? subscription.sku_codes.map((value: unknown) => String(value))
        : [],
    });

  if (isIncompleteSnapshot(snapshot)) {
    snapshot = await buildPurchaseSnapshot({
      roleIds: Array.isArray(subscription.role_ids)
        ? subscription.role_ids.map((value: unknown) => String(value))
        : [],
      skuCodes: Array.isArray(subscription.sku_codes)
        ? subscription.sku_codes.map((value: unknown) => String(value))
        : [],
    });

    await db
      .from("subscriptions")
      .update({
        sku_codes: snapshot.skuCodes,
        package_ids: snapshot.packageIds,
        package_versions: snapshot.packageVersions,
        contract_version: snapshot.contractVersion,
        tenant_profile: snapshot.tenantProfile,
        purchase_snapshot: snapshot,
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscriptionId);
  }

  const customerId = `customer-${String(subscription.id).replace(/-/g, "").slice(0, 8)}`;

  const ensured = await ensureFulfillmentJob({
    subscriptionId,
    userId,
    customerId,
    snapshot: {
      contractVersion: "v2",
      tenantProfile: "runtime_plus_ui_supabase",
      roleIds: Array.isArray(snapshot.roleIds)
        ? snapshot.roleIds.map((value: unknown) => String(value))
        : [],
      skuCodes: Array.isArray(snapshot.skuCodes)
        ? snapshot.skuCodes.map((value: unknown) => String(value))
        : [],
      packageIds: Array.isArray(snapshot.packageIds)
        ? snapshot.packageIds.map((value: unknown) => String(value))
        : [],
      packageVersions: Array.isArray(snapshot.packageVersions)
        ? snapshot.packageVersions.map((value: unknown) => String(value))
        : [],
      packageSources: Array.isArray(snapshot.packageSources)
        ? snapshot.packageSources
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
            .filter((item) => item.packageId && item.owner && item.repo && item.ref)
        : [],
      capturedAt: typeof snapshot.capturedAt === "string" ? snapshot.capturedAt : new Date().toISOString(),
    },
  });

  if (retry) {
    await db
      .from("onboarding_jobs")
      .update({
        state: "payment_confirmed",
        error_code: null,
        error_message: null,
        error_stage: null,
        next_retry_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        updated_by: `user:${userId}`,
        last_action: "user_retry",
        last_action_at: new Date().toISOString(),
      })
      .eq("id", ensured.onboardingJobId);

    await db.from("onboarding_job_events").insert({
      onboarding_job_id: ensured.onboardingJobId,
      state: "payment_confirmed",
      stage: "user_retry",
      detail: { trigger: "customer_ui" },
      actor: `user:${userId}`,
    });
  }

  return NextResponse.json({
    ok: true,
    onboardingJobId: ensured.onboardingJobId,
    state: retry ? "payment_confirmed" : ensured.state,
    idempotencyKey: ensured.idempotencyKey,
    retried: retry,
  });
}
