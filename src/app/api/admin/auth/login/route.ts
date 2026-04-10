import { NextRequest, NextResponse } from "next/server";

import {
  applyAdminSessionCookie,
  createAdminSession,
  getAdminUserByUsername,
  recordAdminLoginFailure,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { username?: unknown; password?: unknown };
  const username = String(body.username || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!username || !password) {
    return NextResponse.json({ ok: false, error: "username and password are required" }, { status: 400 });
  }

  const adminUser = await getAdminUserByUsername(username).catch(() => null);
  if (!adminUser || String(adminUser.status) !== "active") {
    await recordAdminLoginFailure(username, req, "user_not_found");
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await verifyAdminPassword(password, adminUser.password_hash).catch(() => false);
  if (!valid) {
    await recordAdminLoginFailure(username, req, "invalid_password");
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
  }

  const created = await createAdminSession({
    adminUserId: String(adminUser.id),
    username: String(adminUser.username),
    role: String(adminUser.role || "super_admin"),
    req,
  });

  const res = NextResponse.json({
    ok: true,
    session: {
      username: created.session.username,
      role: created.session.role,
      expiresAt: created.session.expiresAt,
    },
  });
  applyAdminSessionCookie(res, created.cookieValue, created.session.expiresAt);
  return res;
}
