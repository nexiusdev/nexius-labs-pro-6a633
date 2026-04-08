import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getUserIdFromRequest } from "@/lib/auth-server";
import { ensureCustomerEntitlements } from "@/lib/entitlements";
import { buildCustomerIdFromSubscription } from "@/lib/fulfillment";

const db = supabaseAdmin.schema("nexius_os");

type BillingCheckoutResponse = {
  subscription_id?: string;
  status?: string;
};

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id") || "";
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

  const { data, error } = await db
    .from("subscriptions")
    .select(
      "id,status,monthly_amount,currency,billing_starts_at,role_ids,user_id,provider_checkout_id,provider_subscription_id,package_ids,package_versions,contract_version,purchase_snapshot"
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
      const checkout = await airwallexFetch<BillingCheckoutResponse>(`/api/v1/billing_checkouts/${data.provider_checkout_id}`, {
        method: "GET",
      });

      const providerSubId = String(checkout?.subscription_id || "").trim();
      const checkoutStatus = String(checkout?.status || "").toUpperCase();

      if (providerSubId && providerSubId !== data.provider_subscription_id) {
        await db
          .from("subscriptions")
          .update({ provider_subscription_id: providerSubId })
          .eq("id", data.id);
        data.provider_subscription_id = providerSubId;
      }

      if (checkoutStatus === "COMPLETED") {
        await db.from("subscriptions").update({ status: "active" }).eq("id", data.id);
        data.status = "active";
      }
    } catch {
      // ignore reconciliation failures; webhooks will eventually catch up
    }
  }

  if (data.status === "active") {
    const customerId = buildCustomerIdFromSubscription(String(data.id));
    const purchaseSnapshot = data.purchase_snapshot && typeof data.purchase_snapshot === "object"
      ? (data.purchase_snapshot as Record<string, unknown>)
      : {};
    const roleIds = Array.isArray(purchaseSnapshot.roleIds)
      ? purchaseSnapshot.roleIds.map((value: unknown) => String(value))
      : (data.role_ids || []).map((value: unknown) => String(value));
    const packageIds = Array.isArray(purchaseSnapshot.packageIds)
      ? purchaseSnapshot.packageIds.map((value: unknown) => String(value))
      : (data.package_ids || []).map((value: unknown) => String(value));
    const packageVersions = Array.isArray(purchaseSnapshot.packageVersions)
      ? purchaseSnapshot.packageVersions.map((value: unknown) => String(value))
      : (data.package_versions || []).map((value: unknown) => String(value));

    await ensureCustomerEntitlements({
      userId,
      subscriptionId: data.id,
      customerId,
      roleIds,
      packageIds,
      packageVersions,
      contractVersion: String(data.contract_version || "v2"),
      actor: "system:subscription_status",
    }).catch(() => {});
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
