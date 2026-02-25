import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { attachVisitorCookie, resolveVisitorId } from "@/lib/visitor-server";

const db = supabaseAdmin.schema("nexius_os");

export async function GET(req: NextRequest) {
  const visitorId = resolveVisitorId(req, req.nextUrl.searchParams.get("visitorId"));

  const { data: session } = await db
    .from("shortlist_sessions")
    .select("id")
    .eq("visitor_id", visitorId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!session) return attachVisitorCookie(NextResponse.json({ roleIds: [] }), visitorId);

  const { data: items } = await db
    .from("shortlist_items")
    .select("role_id")
    .eq("session_id", session.id)
    .order("added_at", { ascending: true });

  return attachVisitorCookie(
    NextResponse.json({ roleIds: (items ?? []).map((i) => i.role_id as string) }),
    visitorId
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const visitorId = resolveVisitorId(req, body?.visitorId);
  const roleIds: string[] = Array.isArray(body?.roleIds) ? body.roleIds : [];

  let { data: session } = await db
    .from("shortlist_sessions")
    .select("id")
    .eq("visitor_id", visitorId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!session) {
    const created = await db.from("shortlist_sessions").insert({ visitor_id: visitorId }).select("id").single();
    if (created.error) return NextResponse.json({ error: created.error.message }, { status: 500 });
    session = created.data;
  }

  await db.from("shortlist_items").delete().eq("session_id", session.id);

  if (roleIds.length > 0) {
    const rows = roleIds.map((roleId) => ({ session_id: session.id, role_id: roleId }));
    const ins = await db.from("shortlist_items").insert(rows);
    if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 500 });
  }

  await db.from("visitor_events").insert({
    visitor_id: visitorId,
    event_type: "shortlist_updated",
    payload: { shortlist_count: roleIds.length },
  });

  return attachVisitorCookie(NextResponse.json({ ok: true }), visitorId);
}
