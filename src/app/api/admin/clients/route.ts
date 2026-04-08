import { NextRequest, NextResponse } from "next/server";

import { getClients } from "@/lib/admin-data";
import { ADMIN_ALLOWED, requireRole } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ADMIN_ALLOWED);
  if (!auth.ok) return auth.response;

  const limit = Math.min(200, Math.max(1, Number(req.nextUrl.searchParams.get("limit") || "100")));

  try {
    const clients = await getClients(limit);
    return NextResponse.json({ ok: true, clients, role: auth.role });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed" }, { status: 500 });
  }
}
