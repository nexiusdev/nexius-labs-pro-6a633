import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";

import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import type { AdminRole } from "@/lib/rbac";

const scrypt = promisify(scryptCallback);
const db = supabaseAdmin.schema("nexius_os");

export const ADMIN_SESSION_COOKIE = "nexius_admin_session";

type AdminUserRow = {
  id: string;
  username: string;
  password_hash: string;
  status: string;
  role: string;
};

export type AdminSession = {
  sessionId: string;
  adminUserId: string;
  username: string;
  role: AdminRole;
  expiresAt: string;
};

function roleOrDefault(value: unknown): AdminRole {
  const role = String(value || "").trim();
  if (role === "ops_admin" || role === "support_admin" || role === "read_only_admin") return role;
  return "super_admin";
}

function sessionTtlHours() {
  return Math.min(24 * 30, Math.max(1, Number(process.env.ADMIN_SESSION_TTL_HOURS || "12")));
}

function nowIso() {
  return new Date().toISOString();
}

function clientIp(req: NextRequest) {
  return (req.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() || null;
}

function userAgent(req: NextRequest) {
  return (req.headers.get("user-agent") || "").trim() || null;
}

function passwordHashPrefix() {
  return "scrypt";
}

export async function hashAdminPassword(password: string) {
  const salt = randomBytes(16);
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${passwordHashPrefix()}:${salt.toString("base64url")}:${derived.toString("base64url")}`;
}

export async function verifyAdminPassword(password: string, storedHash: string) {
  const [scheme, saltEncoded, expectedEncoded] = String(storedHash || "").split(":");
  if (scheme !== passwordHashPrefix() || !saltEncoded || !expectedEncoded) return false;

  const salt = Buffer.from(saltEncoded, "base64url");
  const expected = Buffer.from(expectedEncoded, "base64url");
  const actual = (await scrypt(password, salt, expected.length)) as Buffer;
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function hashAdminSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function recordAdminAuthEvent(params: {
  adminUserId?: string | null;
  username?: string | null;
  eventType: string;
  success: boolean;
  req?: NextRequest;
  metadata?: Record<string, unknown>;
}) {
  await db.from("admin_auth_audit").insert({
    admin_user_id: params.adminUserId || null,
    username: params.username || null,
    event_type: params.eventType,
    success: params.success,
    ip_address: params.req ? clientIp(params.req) : null,
    user_agent: params.req ? userAgent(params.req) : null,
    metadata: params.metadata || {},
  });
}

export async function getAdminUserByUsername(username: string) {
  const normalized = username.trim().toLowerCase();
  if (!normalized) return null;

  const { data, error } = await db
    .from("admin_users")
    .select("id,username,password_hash,status,role")
    .eq("username", normalized)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as AdminUserRow | null) || null;
}

export async function createAdminSession(params: {
  adminUserId: string;
  username: string;
  role: string;
  req: NextRequest;
}) {
  const rawToken = randomBytes(32).toString("base64url");
  const sessionTokenHash = hashAdminSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + sessionTtlHours() * 60 * 60 * 1000).toISOString();

  const { data, error } = await db
    .from("admin_sessions")
    .insert({
      admin_user_id: params.adminUserId,
      session_token_hash: sessionTokenHash,
      expires_at: expiresAt,
      ip_address: clientIp(params.req),
      user_agent: userAgent(params.req),
      last_seen_at: nowIso(),
    })
    .select("id")
    .single();

  if (error || !data?.id) throw new Error(error?.message || "Failed to create admin session");

  await db
    .from("admin_users")
    .update({
      last_login_at: nowIso(),
      updated_at: nowIso(),
      updated_by: `admin:${params.adminUserId}`,
    })
    .eq("id", params.adminUserId);

  await recordAdminAuthEvent({
    adminUserId: params.adminUserId,
    username: params.username,
    eventType: "login_success",
    success: true,
    req: params.req,
    metadata: { role: params.role, sessionId: String(data.id) },
  }).catch(() => undefined);

  return {
    cookieValue: rawToken,
    session: {
      sessionId: String(data.id),
      adminUserId: params.adminUserId,
      username: params.username,
      role: roleOrDefault(params.role),
      expiresAt,
    } satisfies AdminSession,
  };
}

export function applyAdminSessionCookie(res: NextResponse, token: string, expiresAt: string) {
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export function clearAdminSessionCookie(res: NextResponse) {
  res.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

export async function getAdminSessionFromRequest(req: NextRequest): Promise<AdminSession | null> {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value?.trim();
  if (!token) return null;

  const tokenHash = hashAdminSessionToken(token);
  const { data, error } = await db
    .from("admin_sessions")
    .select("id,admin_user_id,expires_at,revoked_at,last_seen_at")
    .eq("session_token_hash", tokenHash)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data?.id || data.revoked_at) return null;
  if (new Date(String(data.expires_at)).getTime() <= Date.now()) return null;

  const { data: adminUser, error: adminUserError } = await db
    .from("admin_users")
    .select("id,username,status,role")
    .eq("id", data.admin_user_id)
    .maybeSingle();

  if (adminUserError) throw new Error(adminUserError.message);
  if (!adminUser?.id || String(adminUser.status) !== "active") return null;

  await db
    .from("admin_sessions")
    .update({ last_seen_at: nowIso() })
    .eq("id", data.id)
    .eq("session_token_hash", tokenHash);

  return {
    sessionId: String(data.id),
    adminUserId: String(adminUser.id),
    username: String(adminUser.username),
    role: roleOrDefault(adminUser.role),
    expiresAt: String(data.expires_at),
  };
}

export async function revokeAdminSession(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value?.trim();
  if (!token) return null;
  const tokenHash = hashAdminSessionToken(token);

  const { data, error } = await db
    .from("admin_sessions")
    .select("id,admin_user_id")
    .eq("session_token_hash", tokenHash)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.id) return null;

  await db
    .from("admin_sessions")
    .update({ revoked_at: nowIso() })
    .eq("id", data.id);

  const { data: adminUser } = await db
    .from("admin_users")
    .select("username")
    .eq("id", data.admin_user_id)
    .maybeSingle();

  await recordAdminAuthEvent({
    adminUserId: String(data.admin_user_id),
    username: adminUser?.username ? String(adminUser.username) : null,
    eventType: "logout",
    success: true,
    req,
    metadata: { sessionId: String(data.id) },
  }).catch(() => undefined);

  return { sessionId: String(data.id), adminUserId: String(data.admin_user_id) };
}

export async function recordAdminLoginFailure(username: string, req: NextRequest, reason: string) {
  await recordAdminAuthEvent({
    username,
    eventType: "login_failure",
    success: false,
    req,
    metadata: { reason },
  }).catch(() => undefined);
}
