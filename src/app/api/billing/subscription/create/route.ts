import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getUserIdFromRequest } from "@/lib/auth-server";
import { roles } from "@/data/roles";
import { getRolePricing } from "@/lib/pricing";
import { airwallexCreateBillingCheckoutSubscription, airwallexCreatePrice } from "@/lib/airwallex";

const db = supabaseAdmin.schema("nexius_os");

function computeMonthlySgd(roleIds: string[]): number {
  const byId = new Map(roles.map((r) => [r.id, r] as const));
  let total = 0;
  for (const id of roleIds) {
    const role = byId.get(id);
    if (!role) throw new Error(`Unknown role: ${id}`);
    total += getRolePricing({ workflow: role.workflow, complexity: role.complexity, governance: role.governance }).monthlySgd;
  }
  return total;
}


export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const roleIds: string[] = Array.isArray(body?.roleIds)
    ? body.roleIds.map((x: unknown) => String(x).trim()).filter(Boolean)
    : [];

  if (!roleIds.length) {
    return NextResponse.json({ error: "roleIds is required" }, { status: 400 });
  }

  // Pricing (server authoritative)
  let monthlyAmount = 0;
  try {
    monthlyAmount = computeMonthlySgd(roleIds);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Invalid roles" }, { status: 400 });
  }

  const productId = (process.env.AIRWALLEX_PRODUCT_ID || "").trim();
  if (!productId) return NextResponse.json({ error: "Missing AIRWALLEX_PRODUCT_ID" }, { status: 500 });

  const appBase = (process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_BASE_URL || "").trim();
  if (!appBase) return NextResponse.json({ error: "Missing APP_BASE_URL" }, { status: 500 });

  // Create local subscription first (charge starts immediately on subscription day)
  const billingStartsAt = new Date();

  const { data: created, error: createErr } = await db
    .from("subscriptions")
    .insert({
      user_id: userId,
      role_ids: roleIds,
      currency: "SGD",
      monthly_amount: monthlyAmount,
      status: "initiated",
      billing_starts_at: billingStartsAt.toISOString(),
    })
    .select("id")
    .single();

  if (createErr || !created?.id) {
    return NextResponse.json({ error: createErr?.message || "Failed to create subscription" }, { status: 500 });
  }

  const subscriptionId = created.id as string;

  try {
    // Create a one-off recurring price matching this subscription amount.
    const price = await airwallexCreatePrice({ productId, currency: "SGD", flatAmount: monthlyAmount });
    const priceId = String((price as any)?.id || "");
    if (!priceId) throw new Error("Airwallex: missing price id");

    const successUrl = new URL("/payment/success", appBase);
    successUrl.searchParams.set("subscription", subscriptionId);

    const backUrl = new URL("/payment", appBase);
    backUrl.searchParams.set("roles", roleIds.join(","));

    const checkout = await airwallexCreateBillingCheckoutSubscription({
      priceId,
      successUrl: successUrl.toString(),
      backUrl: backUrl.toString(),
      // No trial: charge starts immediately
      metadata: {
        nexius_subscription_id: subscriptionId,
        user_id: userId,
      },
    });

    const checkoutId = String((checkout as any)?.id || "");
    const checkoutUrl = String((checkout as any)?.url || "");
    const providerSubscriptionId = String((checkout as any)?.subscription_id || "");

    // Billing checkout may return subscription_id only after completion.
    // We keep status=initiated until webhook updates it to active.
    await db
      .from("subscriptions")
      .update({
        provider: "airwallex",
        provider_price_id: priceId,
        provider_checkout_id: checkoutId || null,
        provider_subscription_id: providerSubscriptionId || null,
        status: "initiated",
      })
      .eq("id", subscriptionId);

    if (!checkoutUrl) throw new Error("Airwallex: missing checkout url");

    return NextResponse.json({ ok: true, checkoutUrl, subscriptionId });
  } catch (e) {
    await db.from("subscriptions").update({ status: "failed" }).eq("id", subscriptionId);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Airwallex error" }, { status: 500 });
  }
}
