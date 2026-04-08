import { NextRequest, NextResponse } from "next/server";

import { getDashboardSummary } from "@/lib/admin-data";
import { ADMIN_ALLOWED, requireRole } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ADMIN_ALLOWED);
  if (!auth.ok) return auth.response;

  try {
    const summary = await getDashboardSummary();
    return NextResponse.json({ ok: true, summary, role: auth.role });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed" }, { status: 500 });
  }
}
