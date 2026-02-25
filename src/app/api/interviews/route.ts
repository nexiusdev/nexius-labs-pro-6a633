import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { attachVisitorCookie, resolveVisitorId } from "@/lib/visitor-server";

const db = supabaseAdmin.schema("nexius_os");
type Msg = { role: "system" | "user" | "assistant"; text: string; timestamp: number };

export async function GET(req: NextRequest) {
  const visitorId = resolveVisitorId(req, req.nextUrl.searchParams.get("visitorId"));

  const { data: sessionsRaw } = await db
    .from("interview_sessions")
    .select("id,role_id,started_at,last_active_at")
    .eq("visitor_id", visitorId)
    .order("started_at", { ascending: true });

  const sessions: Record<string, { roleId: string; messages: Msg[]; startedAt: number; lastActiveAt: number }> = {};

  for (const s of sessionsRaw ?? []) {
    const { data: msgs } = await db
      .from("interview_messages")
      .select("role,text,timestamp_ms,created_at,seq")
      .eq("session_id", s.id)
      .order("seq", { ascending: true });

    sessions[s.role_id as string] = {
      roleId: s.role_id as string,
      messages: (msgs ?? []).map((m) => ({
        role: m.role as Msg["role"],
        text: m.text as string,
        timestamp: Number(m.timestamp_ms ?? Date.parse(m.created_at as string)),
      })),
      startedAt: Date.parse(s.started_at as string),
      lastActiveAt: Date.parse(s.last_active_at as string),
    };
  }

  return attachVisitorCookie(NextResponse.json({ sessions }), visitorId);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const visitorId = resolveVisitorId(req, body?.visitorId);
  const roleId: string | undefined = body?.roleId;
  const messages: Msg[] = Array.isArray(body?.messages) ? body.messages : [];

  if (!roleId) {
    return NextResponse.json({ error: "roleId required" }, { status: 400 });
  }

  let { data: session } = await db
    .from("interview_sessions")
    .select("id")
    .eq("visitor_id", visitorId)
    .eq("role_id", roleId)
    .order("started_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!session) {
    const created = await db
      .from("interview_sessions")
      .insert({ visitor_id: visitorId, role_id: roleId })
      .select("id")
      .single();
    if (created.error) return NextResponse.json({ error: created.error.message }, { status: 500 });
    session = created.data;
  }

  await db.from("interview_messages").delete().eq("session_id", session.id);

  if (messages.length > 0) {
    const rows = messages.map((m, idx) => ({
      session_id: session!.id,
      role: m.role,
      text: m.text,
      timestamp_ms: m.timestamp,
      seq: idx + 1,
    }));
    const ins = await db.from("interview_messages").insert(rows);
    if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 500 });
  }

  await db.from("interview_sessions").update({ last_active_at: new Date().toISOString() }).eq("id", session.id);

  const userMessageCount = messages.filter((m) => m.role === "user").length;
  await db.from("visitor_events").insert({
    visitor_id: visitorId,
    event_type: "interview_updated",
    role_id: roleId,
    payload: { user_message_count: userMessageCount, total_messages: messages.length },
  });

  return attachVisitorCookie(NextResponse.json({ ok: true }), visitorId);
}
