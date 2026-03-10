import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getUserIdFromRequest } from "@/lib/auth-server";

const db = supabaseAdmin.schema("nexius_os");

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id") || "";
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

  const { data, error } = await db
    .from("subscriptions")
    .select(
      "id,status,monthly_amount,currency,billing_starts_at,role_ids,user_id,provider_checkout_id,provider_subscription_id"
    )
    .eq("id", id)
    .single();

  if (error || !data) return NextResponse.json({ ok: false, error: error?.message || "Not found" }, { status: 404 });
  if (data.user_id !== userId) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  // If still initiated but we have a checkout id, try to reconcile from Airwallex.
  // This keeps the success page from being "stuck" when webhooks are delayed.
  if (data.status === "initiated" && data.provider_checkout_id) {
    try {
      const { airwallexFetch } = await import("@/lib/airwallex");
      const checkout = await airwallexFetch<any>(`/api/v1/billing_checkouts/${data.provider_checkout_id}`, {
        method: "GET",
      });

      const providerSubId = String(checkout?.subscription_id || "").trim();
      const checkoutStatus = String(checkout?.status || "").toUpperCase();

      if (providerSubId && providerSubId !== data.provider_subscription_id) {
        await db
          .from("subscriptions")
          .update({ provider_subscription_id: providerSubId })
          .eq("id", data.id);
        (data as any).provider_subscription_id = providerSubId;
      }

      if (checkoutStatus === "COMPLETED") {
        await db.from("subscriptions").update({ status: "active" }).eq("id", data.id);
        (data as any).status = "active";
      }
    } catch {
      // ignore reconciliation failures; webhooks will eventually catch up
    }
  }

  return NextResponse.json({
    ok: true,
    subscription: {
      id: data.id,
      status: data.status,
      monthlyAmount: data.monthly_amount,
      currency: data.currency,
      billingStartsAt: data.billing_starts_at,
      roleIds: data.role_ids || [],
    },
  });
}

