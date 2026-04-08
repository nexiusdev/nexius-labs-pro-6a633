import { supabaseAdmin } from "@/lib/supabase-admin";
import { buildPurchaseSnapshot, type PurchaseSnapshot } from "@/lib/purchase-snapshot";
import {
  buildCustomerIdFromSubscription,
  ensureFulfillmentJob,
  reconcileEntitlementsForSubscription,
} from "@/lib/fulfillment";

const db = supabaseAdmin.schema("nexius_os");

export type AirwallexWebhookEvent = {
  id?: string;
  name?: string;
  data?: {
    id?: string;
    subscription_id?: string;
    metadata?: Record<string, unknown>;
    object?: {
      id?: string;
      metadata?: Record<string, unknown>;
      subscription_id?: string;
      payment_intent_id?: string;
      payment_id?: string;
    };
    subscription?: {
      id?: string;
      metadata?: Record<string, unknown>;
    };
    payment_intent_id?: string;
    payment_id?: string;
  };
};

function lower(value: unknown) {
  return String(value || "").toLowerCase();
}

function normalizedMeta(event: AirwallexWebhookEvent): Record<string, unknown> {
  return (
    event?.data?.metadata ||
    event?.data?.object?.metadata ||
    event?.data?.subscription?.metadata ||
    {}
  );
}

async function findSubscription(event: AirwallexWebhookEvent) {
  const meta = normalizedMeta(event);

  const internalSubId = meta?.nexius_subscription_id ? String(meta.nexius_subscription_id) : "";
  if (internalSubId) {
    const { data } = await db
      .from("subscriptions")
      .select(
        "id,user_id,status,role_ids,sku_codes,package_ids,package_versions,purchase_snapshot,contract_version,tenant_profile,provider_subscription_id"
      )
      .eq("id", internalSubId)
      .maybeSingle();
    if (data?.id) return data;
  }

  const providerSubscriptionId =
    String(event?.data?.subscription_id || "") ||
    String(event?.data?.object?.subscription_id || "") ||
    String(event?.data?.subscription?.id || "");

  if (providerSubscriptionId) {
    const { data } = await db
      .from("subscriptions")
      .select(
        "id,user_id,status,role_ids,sku_codes,package_ids,package_versions,purchase_snapshot,contract_version,tenant_profile,provider_subscription_id"
      )
      .eq("provider_subscription_id", providerSubscriptionId)
      .maybeSingle();

    if (data?.id) return data;
  }

  return null;
}

function isInvoicePaid(eventName: string) {
  const normalized = lower(eventName);
  return normalized.includes("invoice") && normalized.includes("paid");
}

function isCancelled(eventName: string) {
  const normalized = lower(eventName);
  return normalized.includes("subscription") && normalized.includes("cancel");
}

function isPastDue(eventName: string) {
  const normalized = lower(eventName);
  return normalized.includes("payment") && (normalized.includes("failed") || normalized.includes("requires"));
}

function extractProviderIds(event: AirwallexWebhookEvent) {
  return {
    providerEventId: String(event.id || "").trim(),
    providerPaymentId:
      String(event?.data?.payment_id || "") ||
      String(event?.data?.payment_intent_id || "") ||
      String(event?.data?.object?.payment_id || "") ||
      String(event?.data?.object?.payment_intent_id || ""),
    providerSessionId: String(event?.data?.id || "").trim(),
    providerSubscriptionId:
      String(event?.data?.subscription_id || "") ||
      String(event?.data?.object?.subscription_id || "") ||
      String(event?.data?.subscription?.id || ""),
  };
}

function buildLedgerIdempotencyKey(event: AirwallexWebhookEvent) {
  const ids = extractProviderIds(event);
  return (
    ids.providerEventId ||
    ids.providerPaymentId ||
    ids.providerSessionId ||
    `${String(event.name || "event").replace(/\s+/g, "_")}-${Date.now()}`
  );
}

function parseSnapshotFromSubscription(subscription: {
  purchase_snapshot?: unknown;
  contract_version?: unknown;
  tenant_profile?: unknown;
  sku_codes?: unknown;
  package_ids?: unknown;
  package_versions?: unknown;
  role_ids?: unknown;
}): PurchaseSnapshot {
  const existing = subscription.purchase_snapshot;
  if (existing && typeof existing === "object") {
    const snap = existing as Record<string, unknown>;

    const roleIds = Array.isArray(snap.roleIds)
      ? snap.roleIds.map((value: unknown) => String(value))
      : Array.isArray(subscription.role_ids)
        ? subscription.role_ids.map((value: unknown) => String(value))
        : [];

    const skuCodes = Array.isArray(snap.skuCodes)
      ? snap.skuCodes.map((value: unknown) => String(value))
      : Array.isArray(subscription.sku_codes)
        ? subscription.sku_codes.map((value: unknown) => String(value))
        : [];

    const packageIds = Array.isArray(snap.packageIds)
      ? snap.packageIds.map((value: unknown) => String(value))
      : Array.isArray(subscription.package_ids)
        ? subscription.package_ids.map((value: unknown) => String(value))
        : [];

    const packageVersions = Array.isArray(snap.packageVersions)
      ? snap.packageVersions.map((value: unknown) => String(value))
      : Array.isArray(subscription.package_versions)
        ? subscription.package_versions.map((value: unknown) => String(value))
        : [];
    const packageSources = Array.isArray(snap.packageSources)
      ? snap.packageSources
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
      : [];

    return {
      contractVersion: "v2",
      tenantProfile: "runtime_plus_ui_supabase",
      roleIds,
      skuCodes,
      packageIds,
      packageVersions,
      packageSources,
      capturedAt: typeof snap.capturedAt === "string" ? snap.capturedAt : new Date().toISOString(),
    };
  }

  return {
    contractVersion: "v2",
    tenantProfile: "runtime_plus_ui_supabase",
    roleIds: Array.isArray(subscription.role_ids) ? subscription.role_ids.map((value: unknown) => String(value)) : [],
    skuCodes: Array.isArray(subscription.sku_codes) ? subscription.sku_codes.map((value: unknown) => String(value)) : [],
    packageIds: Array.isArray(subscription.package_ids) ? subscription.package_ids.map((value: unknown) => String(value)) : [],
    packageVersions: Array.isArray(subscription.package_versions)
      ? subscription.package_versions.map((value: unknown) => String(value))
      : [],
    packageSources: [],
    capturedAt: new Date().toISOString(),
  };
}

function snapshotNeedsRefresh(snapshot: PurchaseSnapshot) {
  return snapshot.packageSources.length === 0 && snapshot.roleIds.length > 0;
}

export async function processAirwallexWebhookEvent(event: AirwallexWebhookEvent) {
  const ids = extractProviderIds(event);
  const idempotencyKey = buildLedgerIdempotencyKey(event);

  const { data: ledger, error: ledgerError } = await db
    .from("payment_events")
    .upsert(
      {
        provider: "airwallex",
        provider_event_id: ids.providerEventId || idempotencyKey,
        provider_payment_id: ids.providerPaymentId || null,
        provider_session_id: ids.providerSessionId || null,
        provider_subscription_id: ids.providerSubscriptionId || null,
        idempotency_key: idempotencyKey,
        status: "received",
        payload: event,
        received_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "provider,provider_event_id" }
    )
    .select("id,status")
    .single();

  if (ledgerError || !ledger?.id) {
    throw new Error(ledgerError?.message || "Failed to persist payment event");
  }

  if (String(ledger.status || "") === "processed") {
    return {
      ok: true,
      duplicate: true,
      paymentEventId: String(ledger.id),
    };
  }

  try {
    const subscription = await findSubscription(event);
    const eventName = String(event?.name || "").trim();

    if (!subscription?.id) {
      await db
        .from("payment_events")
        .update({
          status: "failed",
          error_code: "SUBSCRIPTION_NOT_FOUND",
          error_message: "Unable to map payment event to subscription",
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", ledger.id);

      return {
        ok: true,
        ignored: true,
        reason: "subscription_not_found",
        paymentEventId: String(ledger.id),
      };
    }

    let snapshot = parseSnapshotFromSubscription(subscription);
    if (snapshot.packageIds.length === 0 || snapshotNeedsRefresh(snapshot)) {
      snapshot = await buildPurchaseSnapshot({
        roleIds: snapshot.roleIds,
        skuCodes: snapshot.skuCodes,
      });
    }

    if (isCancelled(eventName)) {
      await db.from("subscriptions").update({ status: "cancelled" }).eq("id", subscription.id);
    } else if (isPastDue(eventName)) {
      await db.from("subscriptions").update({ status: "past_due" }).eq("id", subscription.id);
    } else if (isInvoicePaid(eventName)) {
      await db
        .from("subscriptions")
        .update({
          status: "active",
          contract_version: "v2",
          tenant_profile: "runtime_plus_ui_supabase",
          purchase_snapshot: snapshot,
        })
        .eq("id", subscription.id);

      const customerId = buildCustomerIdFromSubscription(String(subscription.id));

      await reconcileEntitlementsForSubscription({
        subscriptionId: String(subscription.id),
        userId: String(subscription.user_id),
        customerId,
        snapshot,
      });

      await ensureFulfillmentJob({
        subscriptionId: String(subscription.id),
        userId: String(subscription.user_id),
        customerId,
        paymentEventId: String(ledger.id),
        snapshot,
      });
    }

    await db
      .from("payment_events")
      .update({
        status: "processed",
        subscription_id: subscription.id,
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        error_code: null,
        error_message: null,
      })
      .eq("id", ledger.id);

    return {
      ok: true,
      paymentEventId: String(ledger.id),
      subscriptionId: String(subscription.id),
      event: eventName,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "webhook_processing_failed";
    await db
      .from("payment_events")
      .update({
        status: "failed",
        error_code: "WEBHOOK_PROCESSING_FAILED",
        error_message: message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ledger.id);
    throw error;
  }
}

export async function replayPaymentEvent(paymentEventId: string) {
  const { data, error } = await db
    .from("payment_events")
    .select("id,payload,retry_count")
    .eq("id", paymentEventId)
    .single();

  if (error || !data?.id) {
    throw new Error(error?.message || "Payment event not found");
  }

  const payload = data.payload && typeof data.payload === "object" ? data.payload : {};
  const result = await processAirwallexWebhookEvent(payload as AirwallexWebhookEvent);

  await db
    .from("payment_events")
    .update({
      retry_count: Number(data.retry_count || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentEventId);

  return result;
}

export async function persistSubscriptionSnapshot(params: {
  subscriptionId: string;
  roleIds: string[];
  skuCodes?: string[];
}) {
  const snapshot = await buildPurchaseSnapshot({
    roleIds: params.roleIds,
    skuCodes: params.skuCodes || [],
  });

  const { error } = await db
    .from("subscriptions")
    .update({
      role_ids: snapshot.roleIds,
      sku_codes: snapshot.skuCodes,
      package_ids: snapshot.packageIds,
      package_versions: snapshot.packageVersions,
      contract_version: snapshot.contractVersion,
      tenant_profile: snapshot.tenantProfile,
      purchase_snapshot: snapshot,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.subscriptionId);

  if (error) throw new Error(error.message);

  return snapshot;
}
