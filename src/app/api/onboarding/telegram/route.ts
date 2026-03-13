import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getUserIdFromRequest } from "@/lib/auth-server";
import {
  buildCustomerId,
  buildOnboardingIdempotencyKey,
  buildOnboardingRequestId,
  validateTelegramUserId,
} from "@/lib/onboarding";
import {
  assignBotToCustomer,
  dispatchOnboardingToVpsB,
  updateOnboardingJobState,
} from "@/lib/onboarding-dispatch";
import { ensureCustomerEntitlements } from "@/lib/entitlements";

const db = supabaseAdmin.schema("nexius_os");

type OnboardingBody = {
  subscriptionId?: unknown;
  fullName?: unknown;
  telegramUserId?: unknown;
  roleIds?: unknown;
  currency?: unknown;
  monthlyTotal?: unknown;
  sourcePage?: unknown;
  retry?: unknown;
};

async function dispatchExistingOrNewJob(params: {
  onboardingJobId: string;
  customerId: string;
  requestId: string;
  idempotencyKey: string;
  payload: {
    subscriptionId: string;
    fullName: string;
    telegramUserId: string;
    roleIds: string[];
    currency: string;
    monthlyTotal: number;
    sourcePage: string | null;
  };
}) {
  const botAssignment = await assignBotToCustomer(params.customerId);
  const dispatchPayload = {
    // Nexius Control expects camelCase keys with a nested `bot` object.
    customerId: params.customerId,
    fullName: params.payload.fullName,
    telegramUserId: params.payload.telegramUserId,
    roleIds: params.payload.roleIds,
    subscriptionId: params.payload.subscriptionId,
    bot: {
      assignmentId: botAssignment.assignmentId,
      botPoolId: botAssignment.botPoolId,
      botUsername: botAssignment.botUsername,
      tokenSecretRef: botAssignment.tokenSecretRef,
      encryptedToken: botAssignment.encryptedToken,
    },
  };

  const dispatched = await dispatchOnboardingToVpsB({
    customerId: params.customerId,
    idempotencyKey: params.idempotencyKey,
    requestId: params.requestId,
    onboardingJobId: params.onboardingJobId,
    payload: dispatchPayload,
  });

  await updateOnboardingJobState({
    onboardingJobId: params.onboardingJobId,
    state: dispatched.state,
    result: dispatched.result,
    errorCode: dispatched.errorCode ?? null,
    errorMessage: dispatched.errorMessage ?? null,
    actor: "system:onboarding_dispatch",
    action: "dispatch_to_vps_b",
  });

  return dispatched;
}

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as OnboardingBody;
  const subscriptionId = String(body.subscriptionId || "").trim();
  const fullName = String(body.fullName || "").trim();
  const telegramUserId = String(body.telegramUserId || "").trim();
  const retry = body.retry === true;

  if (!subscriptionId) {
    return NextResponse.json({ error: "subscriptionId is required" }, { status: 400 });
  }
  if (!retry && fullName.length < 2) {
    return NextResponse.json({ error: "fullName is required" }, { status: 400 });
  }
  if (!retry && !validateTelegramUserId(telegramUserId)) {
    return NextResponse.json({ error: "telegramUserId must be a numeric Telegram user id" }, { status: 400 });
  }

  const { data: subscription, error: subErr } = await db
    .from("subscriptions")
    .select("id,user_id,status,role_ids,currency,monthly_amount")
    .eq("id", subscriptionId)
    .single();

  if (subErr || !subscription) {
    return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  }
  if (subscription.user_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (subscription.status !== "active") {
    return NextResponse.json({ error: "Subscription must be active before onboarding" }, { status: 409 });
  }

  const customerId = buildCustomerId(fullName, subscriptionId);
  const idempotencyKey = buildOnboardingIdempotencyKey(subscriptionId);
  const requestId = buildOnboardingRequestId();
  const roleIds = Array.isArray(subscription.role_ids)
    ? subscription.role_ids.map((value: unknown) => String(value))
    : [];

  const { data: existingJob } = await db
    .from("onboarding_jobs")
    .select("id,customer_id,state,idempotency_key,request_id,payload")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (existingJob?.id) {
    const existingPayloadRaw = existingJob.payload && typeof existingJob.payload === "object" ? existingJob.payload : {};
    const existingPayload = {
      subscriptionId,
      fullName: String((existingPayloadRaw as { fullName?: unknown }).fullName || fullName || ""),
      telegramUserId: String((existingPayloadRaw as { telegramUserId?: unknown }).telegramUserId || telegramUserId || ""),
      roleIds,
      currency: String((existingPayloadRaw as { currency?: unknown }).currency || subscription.currency || ""),
      monthlyTotal: Number((existingPayloadRaw as { monthlyTotal?: unknown }).monthlyTotal || subscription.monthly_amount || 0),
      sourcePage: typeof (existingPayloadRaw as { sourcePage?: unknown }).sourcePage === "string"
        ? ((existingPayloadRaw as { sourcePage?: string }).sourcePage || null)
        : null,
    };

    if ((existingJob.state === "queued" || existingJob.state === "failed") && existingPayload.fullName && validateTelegramUserId(existingPayload.telegramUserId)) {
      try {
        const dispatched = await dispatchExistingOrNewJob({
          onboardingJobId: String(existingJob.id),
          customerId: String(existingJob.customer_id),
          requestId: String(existingJob.request_id),
          idempotencyKey: String(existingJob.idempotency_key),
          payload: existingPayload,
        });

        return NextResponse.json({
          ok: true,
          onboardingJobId: existingJob.id,
          customerId: existingJob.customer_id,
          state: dispatched.state,
          idempotencyKey: existingJob.idempotency_key,
          requestId: existingJob.request_id,
          reused: true,
          redispatched: true,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to dispatch onboarding";
        await updateOnboardingJobState({
          onboardingJobId: String(existingJob.id),
          state: "failed",
          result: { dispatch: "failed" },
          errorCode: "ONBOARDING_DISPATCH_FAILED",
          errorMessage: message,
          actor: "system:onboarding_dispatch",
          action: "dispatch_failed",
        });

        return NextResponse.json({ error: message }, { status: 500 });
      }
    }

    return NextResponse.json({
      ok: true,
      onboardingJobId: existingJob.id,
      customerId: existingJob.customer_id,
      state: existingJob.state,
      idempotencyKey: existingJob.idempotency_key,
      requestId: existingJob.request_id,
      reused: true,
    });
  }

  try {
    await ensureCustomerEntitlements({
      userId,
      subscriptionId,
      customerId,
      roleIds,
      actor: `user:${userId}`,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create entitlements" }, { status: 500 });
  }

  const payload = {
    subscriptionId,
    fullName,
    telegramUserId,
    roleIds,
    currency: String(subscription.currency || ""),
    monthlyTotal: Number(subscription.monthly_amount || 0),
    sourcePage: typeof body.sourcePage === "string" ? body.sourcePage : null,
  };

  const { data: created, error: createErr } = await db
    .from("onboarding_jobs")
    .insert({
      user_id: userId,
      subscription_id: subscriptionId,
      customer_id: customerId,
      idempotency_key: idempotencyKey,
      request_id: requestId,
      state: "queued",
      payload,
      created_by: `user:${userId}`,
      updated_by: `user:${userId}`,
      last_action: "create_job",
      last_action_at: new Date().toISOString(),
    })
    .select("id,customer_id,state,idempotency_key,request_id")
    .single();

  if (createErr || !created) {
    return NextResponse.json({ error: createErr?.message || "Failed to create onboarding job" }, { status: 500 });
  }

  try {
    const dispatched = await dispatchExistingOrNewJob({
      onboardingJobId: String(created.id),
      customerId,
      requestId: String(created.request_id),
      idempotencyKey: String(created.idempotency_key),
      payload,
    });

    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        full_name: fullName,
        telegram_user_id: telegramUserId,
      },
    });

    return NextResponse.json({
      ok: true,
      onboardingJobId: created.id,
      customerId: created.customer_id,
      state: dispatched.state,
      idempotencyKey: created.idempotency_key,
      requestId: created.request_id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to assign bot";
    await updateOnboardingJobState({
      onboardingJobId: String(created.id),
      state: "failed",
      result: { dispatch: "failed" },
      errorCode: "BOT_ASSIGNMENT_FAILED",
      errorMessage: message,
      actor: `user:${userId}`,
      action: "assign_bot_failed",
    });

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const subscriptionId = (req.nextUrl.searchParams.get("subscriptionId") || "").trim();
  if (!subscriptionId) {
    return NextResponse.json({ ok: false, error: "subscriptionId is required" }, { status: 400 });
  }

  const { data: subscription, error: subErr } = await db
    .from("subscriptions")
    .select("id,user_id")
    .eq("id", subscriptionId)
    .single();

  if (subErr || !subscription) {
    return NextResponse.json({ ok: false, error: "Subscription not found" }, { status: 404 });
  }
  if (subscription.user_id !== userId) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const { data: job, error: jobErr } = await db
    .from("onboarding_jobs")
    .select("id,customer_id,state,idempotency_key,request_id,error_code,error_message,result")
    .eq("subscription_id", subscriptionId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (jobErr) {
    return NextResponse.json({ ok: false, error: jobErr.message }, { status: 500 });
  }

  if (!job) {
    return NextResponse.json({ ok: true, onboardingJob: null });
  }

  return NextResponse.json({
    ok: true,
    onboardingJob: {
      id: job.id,
      customerId: job.customer_id,
      state: job.state,
      idempotencyKey: job.idempotency_key,
      requestId: job.request_id,
      errorCode: job.error_code,
      errorMessage: job.error_message,
      result: job.result || {},
    },
  });
}
