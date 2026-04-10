import { NextRequest, NextResponse } from "next/server";

import { ADMIN_ALLOWED, requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase-admin";

const db = supabaseAdmin.schema("nexius_os");

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ADMIN_ALLOWED);
  if (!auth.ok) return auth.response;

  const stateFilter = (req.nextUrl.searchParams.get("state") || "").trim();
  const errorStage = (req.nextUrl.searchParams.get("error_stage") || "").trim();
  const ageMinutes = Number(req.nextUrl.searchParams.get("age_minutes") || "0");
  const limit = Math.min(100, Math.max(1, Number(req.nextUrl.searchParams.get("limit") || "50")));

  let query = db
    .from("onboarding_jobs")
    .select(
      "id,customer_id,subscription_id,state,error_code,error_message,error_stage,retry_count,updated_at,created_at,request_payload,response_payload"
    )
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (stateFilter) query = query.eq("state", stateFilter);
  if (errorStage) query = query.eq("error_stage", errorStage);

  if (ageMinutes > 0) {
    const before = new Date(Date.now() - ageMinutes * 60_000).toISOString();
    query = query.lte("updated_at", before);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, jobs: data || [] });
}
