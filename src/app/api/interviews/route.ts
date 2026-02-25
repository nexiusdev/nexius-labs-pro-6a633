import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type Msg = { role: "system" | "user" | "assistant"; text: string; timestamp: number };

export async function GET(req: NextRequest) {
  const visitorId = req.nextUrl.searchParams.get("visitorId");
  if (!visitorId) return NextResponse.json({ sessions: {} });

  const sessionsRes = await db.query(
    `select id, role_id, extract(epoch from started_at)*1000 as started_at_ms, extract(epoch from last_active_at)*1000 as last_active_at_ms
     from nexius_os.interview_sessions
     where visitor_id = $1`,
    [visitorId]
  );

  const sessions: Record<string, { roleId: string; messages: Msg[]; startedAt: number; lastActiveAt: number }> = {};

  for (const row of sessionsRes.rows) {
    const msgsRes = await db.query(
      `select role, text, coalesce(timestamp_ms, (extract(epoch from created_at)*1000)::bigint) as timestamp_ms
       from nexius_os.interview_messages
       where session_id = $1
       order by coalesce(seq,0) asc, created_at asc`,
      [row.id]
    );

    sessions[row.role_id] = {
      roleId: row.role_id,
      messages: msgsRes.rows.map((m) => ({ role: m.role, text: m.text, timestamp: Number(m.timestamp_ms) })),
      startedAt: Number(row.started_at_ms || Date.now()),
      lastActiveAt: Number(row.last_active_at_ms || Date.now()),
    };
  }

  return NextResponse.json({ sessions });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const visitorId: string | undefined = body?.visitorId;
  const roleId: string | undefined = body?.roleId;
  const messages: Msg[] = Array.isArray(body?.messages) ? body.messages : [];

  if (!visitorId || !roleId) {
    return NextResponse.json({ error: "visitorId and roleId required" }, { status: 400 });
  }

  const client = await db.connect();
  try {
    await client.query("begin");

    const existing = await client.query(
      `select id from nexius_os.interview_sessions where visitor_id=$1 and role_id=$2 order by started_at asc limit 1`,
      [visitorId, roleId]
    );

    let sessionId = existing.rows[0]?.id as string | undefined;
    if (!sessionId) {
      const created = await client.query(
        `insert into nexius_os.interview_sessions(visitor_id, role_id)
         values($1,$2)
         returning id`,
        [visitorId, roleId]
      );
      sessionId = created.rows[0]?.id;
    }
    if (!sessionId) throw new Error("Unable to resolve interview session");

    await client.query(`delete from nexius_os.interview_messages where session_id = $1`, [sessionId]);

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      await client.query(
        `insert into nexius_os.interview_messages(session_id, role, text, timestamp_ms, seq)
         values($1,$2,$3,$4,$5)`,
        [sessionId, msg.role, msg.text, msg.timestamp, i + 1]
      );
    }

    await client.query(
      `update nexius_os.interview_sessions set last_active_at = now() where id = $1`,
      [sessionId]
    );

    await client.query("commit");
    return NextResponse.json({ ok: true });
  } catch {
    await client.query("rollback");
    return NextResponse.json({ error: "failed to save interview" }, { status: 500 });
  } finally {
    client.release();
  }
}
