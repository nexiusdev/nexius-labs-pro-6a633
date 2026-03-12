import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getUserIdFromRequest } from "@/lib/auth-server";

const db = supabaseAdmin.schema("nexius_os");

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { data: subscriptions, error: subErr } = await db
    .from("subscriptions")
    .select(
      "id,status,monthly_amount,currency,billing_starts_at,role_ids,provider_subscription_id,provider_checkout_id,created_at"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (subErr) {
    return NextResponse.json({ ok: false, error: subErr.message }, { status: 500 });
  }

  const subscriptionIds = (subscriptions || []).map((row) => String(row.id));
  const onboardingBySubscription = new Map<string, { state: string; customer_id: string | null }>();

  if (subscriptionIds.length > 0) {
    const { data: jobs, error: jobsErr } = await db
      .from("onboarding_jobs")
      .select("subscription_id,state,customer_id,created_at")
      .in("subscription_id", subscriptionIds)
      .order("created_at", { ascending: false });

    if (jobsErr) {
      return NextResponse.json({ ok: false, error: jobsErr.message }, { status: 500 });
    }

    for (const job of jobs || []) {
      const key = String(job.subscription_id);
      if (onboardingBySubscription.has(key)) continue;
      onboardingBySubscription.set(key, {
        state: String(job.state),
        customer_id: job.customer_id ? String(job.customer_id) : null,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    subscriptions: (subscriptions || []).map((row) => ({
      id: String(row.id),
      status: String(row.status),
      monthlyAmount: Number(row.monthly_amount || 0),
      currency: String(row.currency || "SGD"),
      billingStartsAt: row.billing_starts_at ? String(row.billing_starts_at) : null,
      roleIds: Array.isArray(row.role_ids) ? row.role_ids.map((value: unknown) => String(value)) : [],
      createdAt: row.created_at ? String(row.created_at) : null,
      providerSubscriptionId: row.provider_subscription_id ? String(row.provider_subscription_id) : null,
      providerCheckoutId: row.provider_checkout_id ? String(row.provider_checkout_id) : null,
      onboarding: onboardingBySubscription.get(String(row.id)) || null,
    })),
  });
}
