import { NextRequest, NextResponse } from "next/server";

import { getJobDetail } from "@/lib/admin-data";
import { ADMIN_ALLOWED, requireRole } from "@/lib/rbac";

export async function GET(req: NextRequest, context: { params: Promise<{ jobId: string }> }) {
  const auth = await requireRole(req, ADMIN_ALLOWED);
  if (!auth.ok) return auth.response;

  const { jobId } = await context.params;

  try {
    const detail = await getJobDetail(jobId);
    return NextResponse.json({ ok: true, ...detail, role: auth.role });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed" }, { status: 500 });
  }
}
