import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const db = supabaseAdmin.schema("nexius_os");

export async function GET(req: NextRequest) {
  const visitorId = req.nextUrl.searchParams.get("visitorId");
  if (!visitorId) return NextResponse.json({ roleIds: [] });

  const { data: session } = await db
    .from("shortlist_sessions")
    .select("id")
    .eq("visitor_id", visitorId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!session) return NextResponse.json({ roleIds: [] });

  const { data: items } = await db
    .from("shortlist_items")
    .select("role_id")
    .eq("session_id", session.id)
    .order("added_at", { ascending: true });

  return NextResponse.json({ roleIds: (items ?? []).map((i) => i.role_id as string) });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const visitorId: string | undefined = body?.visitorId;
  const roleIds: string[] = Array.isArray(body?.roleIds) ? body.roleIds : [];

  if (!visitorId) return NextResponse.json({ error: "visitorId required" }, { status: 400 });

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

  return NextResponse.json({ ok: true });
}
