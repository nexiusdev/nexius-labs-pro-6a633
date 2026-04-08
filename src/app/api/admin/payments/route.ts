import { NextRequest, NextResponse } from "next/server";

import { getPayments } from "@/lib/admin-data";
import { ADMIN_ALLOWED, ADMIN_MUTATION_ALLOWED, requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase-admin";

const db = supabaseAdmin.schema("nexius_os");

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ADMIN_ALLOWED);
  if (!auth.ok) return auth.response;

  const limit = Math.min(200, Math.max(1, Number(req.nextUrl.searchParams.get("limit") || "100")));
  try {
    const payments = await getPayments(limit);
    return NextResponse.json({ ok: true, payments, role: auth.role });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ADMIN_MUTATION_ALLOWED);
  if (!auth.ok) return auth.response;

  const body = (await req.json().catch(() => ({}))) as {
    paymentId?: unknown;
    action?: unknown;
    subscriptionId?: unknown;
  };

  const paymentId = String(body.paymentId || "").trim();
  const action = String(body.action || "").trim();
  if (!paymentId || !action) {
    return NextResponse.json({ ok: false, error: "paymentId and action are required" }, { status: 400 });
  }

  if (action === "mark_duplicate") {
    const { error } = await db
      .from("payment_events")
      .update({ status: "duplicate", processed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", paymentId);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  } else if (action === "reprocess") {
    const { error } = await db
      .from("payment_events")
      .update({ status: "received", error_code: null, error_message: null, updated_at: new Date().toISOString() })
      .eq("id", paymentId);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  } else if (action === "relink") {
    const subscriptionId = String(body.subscriptionId || "").trim();
    if (!subscriptionId) {
      return NextResponse.json({ ok: false, error: "subscriptionId required for relink" }, { status: 400 });
    }

    const { error } = await db
      .from("payment_events")
      .update({ subscription_id: subscriptionId, updated_at: new Date().toISOString() })
      .eq("id", paymentId);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  } else {
    return NextResponse.json({ ok: false, error: "Unsupported action" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, paymentId, action });
}
