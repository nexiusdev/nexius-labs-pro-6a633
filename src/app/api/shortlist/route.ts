import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const visitorId = req.nextUrl.searchParams.get("visitorId");
  if (!visitorId) return NextResponse.json({ roleIds: [] });

  const result = await db.query(
    `select si.role_id
     from nexius_os.shortlist_sessions ss
     join nexius_os.shortlist_items si on si.session_id = ss.id
     where ss.visitor_id = $1
     order by si.added_at asc`,
    [visitorId]
  );

  return NextResponse.json({ roleIds: result.rows.map((r) => r.role_id as string) });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const visitorId: string | undefined = body?.visitorId;
  const roleIds: string[] = Array.isArray(body?.roleIds) ? body.roleIds : [];

  if (!visitorId) {
    return NextResponse.json({ error: "visitorId required" }, { status: 400 });
  }

  const client = await db.connect();
  try {
    await client.query("begin");

    const existing = await client.query(
      `select id from nexius_os.shortlist_sessions where visitor_id = $1 order by created_at asc limit 1`,
      [visitorId]
    );

    let sessionId: string | undefined = existing.rows[0]?.id;
    if (!sessionId) {
      const created = await client.query(
        `insert into nexius_os.shortlist_sessions (visitor_id)
         values ($1)
         returning id`,
        [visitorId]
      );
      sessionId = created.rows[0]?.id;
    }

    if (!sessionId) throw new Error("Unable to resolve shortlist session");

    await client.query(`delete from nexius_os.shortlist_items where session_id = $1`, [sessionId]);

    for (const roleId of roleIds) {
      await client.query(
        `insert into nexius_os.shortlist_items(session_id, role_id)
         values ($1,$2)
         on conflict (session_id, role_id) do nothing`,
        [sessionId, roleId]
      );
    }

    await client.query("commit");
    return NextResponse.json({ ok: true });
  } catch {
    await client.query("rollback");
    return NextResponse.json({ error: "failed to save shortlist" }, { status: 500 });
  } finally {
    client.release();
  }
}
