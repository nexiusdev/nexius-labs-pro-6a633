import { NextResponse } from "next/server";

export async function GET() {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
  const service = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

  if (!url) return NextResponse.json({ error: "Missing SUPABASE_URL" }, { status: 500 });
  if (!anon) return NextResponse.json({ error: "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY" }, { status: 500 });

  const target = `${url.replace(/\/$/, "")}/rest/v1/roles?select=id&limit=1`;

  async function probe(key: string, label: string) {
    const res = await fetch(target, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Accept-Profile": "nexius_os",
      },
      // ensure no caching issues
      cache: "no-store",
    });

    const text = await res.text();
    return { label, status: res.status, body: text.slice(0, 500) };
  }

  const anonProbe = await probe(anon, "anon");
  const serviceProbe = service ? await probe(service, "service_role") : null;

  return NextResponse.json({
    target,
    anonProbe,
    serviceProbe,
  });
}
