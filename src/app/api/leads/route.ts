import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const db = supabaseAdmin.schema("nexius_os");

export async function POST(req: NextRequest) {
  const body = await req.json();

  const fullName = (body?.name || "").trim();
  const email = (body?.email || "").trim();

  if (!fullName || !email) {
    return NextResponse.json({ error: "name and email are required" }, { status: 400 });
  }

  const { error } = await db.from("leads").insert({
    full_name: fullName,
    company: body?.company || null,
    email,
    phone: body?.phone || null,
    company_size: body?.companySize || null,
    interest: body?.interest || null,
    message: body?.message || null,
    source_page: body?.sourcePage || null,
    referrer: body?.referrer || null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
