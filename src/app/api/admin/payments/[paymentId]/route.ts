import { NextRequest, NextResponse } from "next/server";

import { getPaymentById } from "@/lib/admin-data";
import { ADMIN_ALLOWED, requireRole } from "@/lib/rbac";

export async function GET(req: NextRequest, context: { params: Promise<{ paymentId: string }> }) {
  const auth = await requireRole(req, ADMIN_ALLOWED);
  if (!auth.ok) return auth.response;

  const { paymentId } = await context.params;

  try {
    const payment = await getPaymentById(paymentId);
    return NextResponse.json({ ok: true, payment, role: auth.role });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed" }, { status: 500 });
  }
}
