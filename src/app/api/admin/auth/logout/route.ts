import { NextRequest, NextResponse } from "next/server";

import { clearAdminSessionCookie, revokeAdminSession } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  await revokeAdminSession(req).catch(() => null);
  const res = NextResponse.json({ ok: true });
  clearAdminSessionCookie(res);
  return res;
}
