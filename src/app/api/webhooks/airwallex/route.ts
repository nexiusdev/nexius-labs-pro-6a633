import { NextRequest, NextResponse } from "next/server";

import { verifyAirwallexWebhookSignature } from "@/lib/airwallex";
import { processAirwallexWebhookEvent, type AirwallexWebhookEvent } from "@/lib/airwallex-webhook";

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
  if (!ok) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody || "{}") as AirwallexWebhookEvent;

  try {
    const result = await processAirwallexWebhookEvent(event);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process webhook";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
