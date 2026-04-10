import { NextRequest, NextResponse } from "next/server";

import { getAdminSessionFromRequest } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req).catch(() => null);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    session: {
      adminUserId: session.adminUserId,
      username: session.username,
      role: session.role,
      expiresAt: session.expiresAt,
    },
  });
}
