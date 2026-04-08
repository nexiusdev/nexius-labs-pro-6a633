import { NextRequest, NextResponse } from "next/server";

import { getAuditEvents } from "@/lib/admin-data";
import { ADMIN_ALLOWED, requireRole } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ADMIN_ALLOWED);
  if (!auth.ok) return auth.response;

  const limit = Math.min(500, Math.max(1, Number(req.nextUrl.searchParams.get("limit") || "200")));

  try {
    const events = await getAuditEvents(limit);
    return NextResponse.json({ ok: true, events, role: auth.role });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed" }, { status: 500 });
  }
}
