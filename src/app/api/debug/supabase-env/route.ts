import { NextResponse } from "next/server";
import crypto from "crypto";

function fp(v?: string | null) {
  if (!v) return null;
  const s = String(v);
  if (s.length <= 16) return s;
  return `${s.slice(0, 8)}...${s.slice(-8)} (len=${s.length})`;
}

function sha256(v?: string | null) {
  if (!v) return null;
  return crypto.createHash("sha256").update(String(v), "utf8").digest("hex");
}

export async function GET() {
  // This endpoint intentionally exposes ONLY fingerprints/hashes, not secrets.
  return NextResponse.json({
    SUPABASE_URL: fp(process.env.SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_URL: fp(process.env.NEXT_PUBLIC_SUPABASE_URL),

    NEXT_PUBLIC_SUPABASE_ANON_KEY: fp(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    NEXT_PUBLIC_SUPABASE_ANON_KEY_SHA256: sha256(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),

    SUPABASE_SERVICE_ROLE_KEY: fp(process.env.SUPABASE_SERVICE_ROLE_KEY),
    SUPABASE_SERVICE_ROLE_KEY_SHA256: sha256(process.env.SUPABASE_SERVICE_ROLE_KEY),
  });
}
