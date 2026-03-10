import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAirwallexWebhookSignature } from "@/lib/airwallex";

const db = supabaseAdmin.schema("nexius_os");

export async function POST(req: NextRequest) {
  const secret = (process.env.AIRWALLEX_WEBHOOK_SECRET || "").trim();
  if (!secret) return NextResponse.json({ error: "Missing AIRWALLEX_WEBHOOK_SECRET" }, { status: 500 });

  const timestamp = req.headers.get("x-timestamp") || "";
  const signature = req.headers.get("x-signature") || "";

  const rawBody = await req.text();

  if (!timestamp || !signature) {
    return NextResponse.json({ error: "Missing webhook signature headers" }, { status: 400 });
  }

  const ok = verifyAirwallexWebhookSignature({ secret, timestamp, signature, rawBody });
  if (!ok) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  const event = JSON.parse(rawBody || "{}") as any;
  const eventId = String(event?.id || "");
  const eventName = String(event?.name || "");

  // Idempotency: ignore already-processed events
  if (eventId) {
    const { data: existing } = await db
      .from("subscription_events")
      .select("id")
      .eq("provider_event_id", eventId)
      .maybeSingle();
    if (existing?.id) return NextResponse.json({ ok: true });
  }

  // Try to map to our subscription via metadata (preferred).
  const meta = event?.data?.metadata || event?.data?.object?.metadata || event?.data?.subscription?.metadata;
  const internalSubId = meta?.nexius_subscription_id ? String(meta.nexius_subscription_id) : null;

  if (internalSubId) {
    await db.from("subscription_events").insert({
      subscription_id: internalSubId,
      provider_event_id: eventId || null,
      event_type: eventName || null,
      payload: event,
    });

    // Minimal status mapping (expand as you learn exact event names you receive)
    const normalized = eventName.toLowerCase();
    if (normalized.includes("subscription") && normalized.includes("cancel")) {
      await db.from("subscriptions").update({ status: "cancelled" }).eq("id", internalSubId);
    } else if (normalized.includes("payment") && (normalized.includes("failed") || normalized.includes("requires"))) {
      await db.from("subscriptions").update({ status: "past_due" }).eq("id", internalSubId);
    } else if (normalized.includes("invoice") && normalized.includes("paid")) {
      await db.from("subscriptions").update({ status: "active" }).eq("id", internalSubId);
    }
  }

  // Always ack quickly.
  return NextResponse.json({ ok: true });
}
