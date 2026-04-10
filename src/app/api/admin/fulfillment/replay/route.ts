import { NextRequest, NextResponse } from "next/server";

import { ADMIN_MUTATION_ALLOWED, requireRole } from "@/lib/rbac";
import { replayPaymentEvent } from "@/lib/airwallex-webhook";

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ADMIN_MUTATION_ALLOWED);
  if (!auth.ok) return auth.response;

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
