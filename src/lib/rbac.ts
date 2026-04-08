import { NextRequest, NextResponse } from "next/server";

import { getUserFromRequest, isFulfillmentAdmin } from "@/lib/auth-server";

export type AdminRole = "super_admin" | "ops_admin" | "support_admin" | "read_only_admin";
export type ClientRole = "client_owner" | "client_operator" | "client_viewer";
export type AppRole = AdminRole | ClientRole;

const ADMIN_ROLES: AdminRole[] = ["super_admin", "ops_admin", "support_admin", "read_only_admin"];
const CLIENT_ROLES: ClientRole[] = ["client_owner", "client_operator", "client_viewer"];

function envRoleMap() {
  const pairs = (process.env.APP_ROLE_USER_MAP || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [userId, role] = item.split(":").map((part) => part.trim());
      return { userId, role };
    })
    .filter((entry) => entry.userId && entry.role);

  return new Map<string, string>(pairs.map((entry) => [entry.userId, entry.role]));
}

function coerceRole(value: unknown): AppRole | null {
  const role = String(value || "").trim() as AppRole;
  if (([...ADMIN_ROLES, ...CLIENT_ROLES] as string[]).includes(role)) return role;
  return null;
}

export function resolveAppRole(user: { id: string; user_metadata?: Record<string, unknown> | null }): AppRole {
  const metadata = user.user_metadata || {};

  const metadataRole =
    coerceRole(metadata.app_role) ||
    coerceRole(metadata.role) ||
    (Array.isArray(metadata.roles) ? coerceRole(metadata.roles[0]) : null);

  if (metadataRole) return metadataRole;

  const envRole = coerceRole(envRoleMap().get(user.id));
  if (envRole) return envRole;

  if (isFulfillmentAdmin(user.id)) return "super_admin";

  return "client_owner";
}

export function isAdminRole(role: AppRole) {
  return ADMIN_ROLES.includes(role as AdminRole);
}

export async function requireRole(req: NextRequest, allowed: AppRole[]) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return {
      ok: false as const,
      response: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }),
    };
  }

  const role = resolveAppRole(user as { id: string; user_metadata?: Record<string, unknown> | null });
  if (!allowed.includes(role)) {
    return {
      ok: false as const,
      response: NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 }),
    };
  }

  return {
    ok: true as const,
    user,
    role,
  };
}

export const ADMIN_ALLOWED: AppRole[] = ["super_admin", "ops_admin", "support_admin", "read_only_admin"];
export const ADMIN_MUTATION_ALLOWED: AppRole[] = ["super_admin", "ops_admin", "support_admin"];
export const CLIENT_ALLOWED: AppRole[] = ["client_owner", "client_operator", "client_viewer"];
export const CLIENT_MUTATION_ALLOWED: AppRole[] = ["client_owner", "client_operator"];
