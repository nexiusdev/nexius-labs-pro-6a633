import { NextRequest, NextResponse } from "next/server";

import { ADMIN_ALLOWED, ADMIN_MUTATION_ALLOWED, requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase-admin";

const db = supabaseAdmin.schema("nexius_os");

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ADMIN_ALLOWED);
  if (!auth.ok) return auth.response;

  const limit = Math.min(300, Math.max(1, Number(req.nextUrl.searchParams.get("limit") || "150")));
  const { data, error } = await db
    .from("customer_entitlements")
    .select("id,customer_id,subscription_id,role_id,status,package_id,package_version,contract_version,updated_at")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, entitlements: data || [], role: auth.role });
}

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ADMIN_MUTATION_ALLOWED);
  if (!auth.ok) return auth.response;

  const body = (await req.json().catch(() => ({}))) as {
    action?: unknown;
    customerId?: unknown;
    subscriptionId?: unknown;
    roleId?: unknown;
    packageId?: unknown;
    packageVersion?: unknown;
  };

  const action = String(body.action || "").trim();
  const customerId = String(body.customerId || "").trim();
  const subscriptionId = String(body.subscriptionId || "").trim();
  const roleId = String(body.roleId || "").trim();

  if (!action || !customerId || !subscriptionId || !roleId) {
    return NextResponse.json({ ok: false, error: "action, customerId, subscriptionId, roleId are required" }, { status: 400 });
  }

  if (action === "add") {
    const { error } = await db.from("customer_entitlements").upsert({
      customer_id: customerId,
      subscription_id: subscriptionId,
      role_id: roleId,
      status: "active",
      package_id: String(body.packageId || "") || null,
      package_version: String(body.packageVersion || "") || null,
      contract_version: "v2",
      updated_by: `admin:${auth.user.id}`,
      created_by: `admin:${auth.user.id}`,
      last_action: "admin_add_entitlement",
      last_action_at: new Date().toISOString(),
      entitlement_snapshot: {
        source: "admin",
        updatedAt: new Date().toISOString(),
      },
    }, { onConflict: "subscription_id,role_id" });

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  } else if (action === "revoke") {
    const { error } = await db
      .from("customer_entitlements")
      .update({
        status: "revoked",
        updated_by: `admin:${auth.user.id}`,
        last_action: "admin_revoke_entitlement",
        last_action_at: new Date().toISOString(),
      })
      .eq("customer_id", customerId)
      .eq("subscription_id", subscriptionId)
      .eq("role_id", roleId);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  } else {
    return NextResponse.json({ ok: false, error: "Unsupported action" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, action, customerId, subscriptionId, roleId });
}
