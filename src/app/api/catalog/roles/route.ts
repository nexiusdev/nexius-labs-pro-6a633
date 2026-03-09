import { NextResponse } from "next/server";
import { getAllRolesDb, getExpertByRoleMapDb } from "@/lib/catalog";

export async function GET() {
  try {
    const [roles, expertByRole] = await Promise.all([getAllRolesDb(), getExpertByRoleMapDb()]);
    return NextResponse.json({ roles, expertByRole });
  } catch (e: any) {
    // Don't leak secrets; just return the error message.
    return NextResponse.json(
      { error: e?.message ?? String(e), hint: "Check Netlify SUPABASE_* env vars and Supabase REST schema exposure." },
      { status: 500 }
    );
  }
}
