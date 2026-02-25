import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const fullName = (body?.name || "").trim();
  const email = (body?.email || "").trim();

  if (!fullName || !email) {
    return NextResponse.json({ error: "name and email are required" }, { status: 400 });
  }

  await db.query(
    `insert into nexius_os.leads
      (full_name, company, email, phone, company_size, interest, message, source_page, referrer)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      fullName,
      (body?.company || null) as string | null,
      email,
      (body?.phone || null) as string | null,
      (body?.companySize || null) as string | null,
      (body?.interest || null) as string | null,
      (body?.message || null) as string | null,
      (body?.sourcePage || null) as string | null,
      (body?.referrer || null) as string | null,
    ]
  );

  return NextResponse.json({ ok: true });
}
