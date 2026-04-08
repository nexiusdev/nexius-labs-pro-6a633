import { NextRequest, NextResponse } from "next/server";

import { getUserFromRequest, isFulfillmentAdmin } from "@/lib/auth-server";
import { replayPaymentEvent } from "@/lib/airwallex-webhook";

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (!isFulfillmentAdmin(user.id)) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as { paymentEventId?: unknown };
  const paymentEventId = String(body.paymentEventId || "").trim();
  if (!paymentEventId) {
    return NextResponse.json({ ok: false, error: "paymentEventId is required" }, { status: 400 });
  }

  try {
    const result = await replayPaymentEvent(paymentEventId);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Replay failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
