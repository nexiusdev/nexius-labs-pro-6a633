import { Agent, fetch as undiciFetch } from "undici";

import { supabaseAdmin } from "@/lib/supabase-admin";

const db = supabaseAdmin.schema("nexius_os");

export type AssignedBot = {
  assignmentId: string;
  botPoolId: string;
  botUsername: string;
  tokenSecretRef: string | null;
  encryptedToken: string | null;
};

function requiredOnboardingEnv() {
  const url = (process.env.NEXIUS_CONTROL_ONBOARDING_URL || "").trim();
  const token = (process.env.NEXIUS_CONTROL_ONBOARDING_TOKEN || "").trim();
  const allowSelfSignedTls = (process.env.NEXIUS_CONTROL_ALLOW_SELF_SIGNED_TLS || "").trim() === "true";
  if (!url || !token) return null;
  return { url, token, allowSelfSignedTls };
}

export async function assignBotToCustomer(customerId: string): Promise<AssignedBot> {
  const { data: existing, error: existingErr } = await db
    .from("customer_bot_assignments")
    .select("id, bot_pool_id, telegram_bot_pool!inner(id, bot_username, token_secret_ref, encrypted_token, status)")
    .eq("customer_id", customerId)
    .eq("assignment_status", "assigned")
    .maybeSingle();

  if (existingErr) throw new Error(existingErr.message);

  if (existing?.id) {
    const bot = Array.isArray(existing.telegram_bot_pool) ? existing.telegram_bot_pool[0] : existing.telegram_bot_pool;
    if (!bot) throw new Error("Assigned bot record is incomplete");
    return {
      assignmentId: String(existing.id),
      botPoolId: String(existing.bot_pool_id),
      botUsername: String(bot.bot_username),
      tokenSecretRef: bot.token_secret_ref ? String(bot.token_secret_ref) : null,
      encryptedToken: bot.encrypted_token ? String(bot.encrypted_token) : null,
    };
  }

  const { data: bot, error: botErr } = await db
    .from("telegram_bot_pool")
    .select("id, bot_username, token_secret_ref, encrypted_token, assigned_count")
    .eq("status", "active")
    .order("assigned_count", { ascending: true })
    .order("last_used_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (botErr) throw new Error(botErr.message);
  if (!bot?.id) throw new Error("No active Telegram bots available");

  const now = new Date().toISOString();

  const { data: assignment, error: assignmentErr } = await db
    .from("customer_bot_assignments")
    .insert({
      customer_id: customerId,
      bot_pool_id: bot.id,
      assignment_status: "assigned",
      assigned_at: now,
      created_by: "system:onboarding_dispatch",
      updated_by: "system:onboarding_dispatch",
      last_action: "assign_bot",
      last_action_at: now,
    })
    .select("id")
    .single();

  if (assignmentErr || !assignment?.id) {
    throw new Error(assignmentErr?.message || "Failed to create bot assignment");
  }

  const { error: updateErr } = await db
    .from("telegram_bot_pool")
    .update({
      assigned_count: Number(bot.assigned_count || 0) + 1,
      last_used_at: now,
      updated_at: now,
      updated_by: "system:onboarding_dispatch",
      last_action: "assign_bot",
      last_action_at: now,
    })
    .eq("id", bot.id);

  if (updateErr) throw new Error(updateErr.message);

  return {
    assignmentId: String(assignment.id),
    botPoolId: String(bot.id),
    botUsername: String(bot.bot_username),
    tokenSecretRef: bot.token_secret_ref ? String(bot.token_secret_ref) : null,
    encryptedToken: bot.encrypted_token ? String(bot.encrypted_token) : null,
  };
}

export async function dispatchOnboardingToVpsB(params: {
  customerId: string;
  idempotencyKey: string;
  requestId: string;
  onboardingJobId: string;
  payload: Record<string, unknown>;
}) {
  const config = requiredOnboardingEnv();
  if (!config) {
    return {
      dispatched: false,
      state: "queued",
      result: {
        dispatch: "skipped",
        reason: "missing_nexius_control_onboarding_config",
      },
    };
  }

  const controller = new AbortController();
  const timeoutMs = Number(process.env.NEXIUS_CONTROL_ONBOARDING_TIMEOUT_MS || 60000);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await undiciFetch(config.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${config.token}`,
        "Idempotency-Key": params.idempotencyKey,
        "X-Request-Id": params.requestId,
        // Nexius Control expects a human-friendly job ref like: job_<requestId-without-prefix>
        // Keep the canonical UUID in a separate header for debugging.
        "X-Onboarding-Job-Id": `job_${params.requestId.replace(/^req_/, "")}`,
        "X-Onboarding-Job-UUID": params.onboardingJobId,
      },
      body: JSON.stringify(params.payload),
      signal: controller.signal,
      dispatcher: config.allowSelfSignedTls
        ? new Agent({
            connectTimeout: timeoutMs,
            connect: {
              rejectUnauthorized: false,
            },
          })
        : undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const aborted = message.toLowerCase().includes("aborted") || message.toLowerCase().includes("abort");
    return {
      dispatched: true,
      state: "failed",
      result: {
        dispatch: "failed",
        reason: aborted ? "timeout" : "network_error",
        message,
      },
      errorCode: aborted ? "NEXIUS_CONTROL_ONBOARDING_TIMEOUT" : "NEXIUS_CONTROL_ONBOARDING_NETWORK_ERROR",
      errorMessage: aborted
        ? `Nexius Control onboarding request timed out after ${timeoutMs}ms`
        : `Nexius Control onboarding request failed: ${message}`,
    };
  } finally {
    clearTimeout(timeout);
  }

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      dispatched: true,
      state: "failed",
      result: json,
      errorCode: "NEXIUS_CONTROL_ONBOARDING_HTTP_ERROR",
      errorMessage: `Nexius Control onboarding request failed (${response.status})`,
    };
  }

  const state = String((json as { state?: string; status?: string }).state || (json as { status?: string }).status || "in_progress");
  return {
    dispatched: true,
    state,
    result: json,
  };
}

export async function updateOnboardingJobState(params: {
  onboardingJobId: string;
  state: string;
  result: Record<string, unknown>;
  errorCode?: string | null;
  errorMessage?: string | null;
  actor?: string;
  action?: string;
}) {
  const now = new Date().toISOString();
  const { error } = await db
    .from("onboarding_jobs")
    .update({
      state: params.state,
      result: params.result,
      error_code: params.errorCode ?? null,
      error_message: params.errorMessage ?? null,
      updated_at: now,
      updated_by: params.actor || "system:onboarding_dispatch",
      last_action: params.action || "update_state",
      last_action_at: now,
    })
    .eq("id", params.onboardingJobId);

  if (error) throw new Error(error.message);
}
