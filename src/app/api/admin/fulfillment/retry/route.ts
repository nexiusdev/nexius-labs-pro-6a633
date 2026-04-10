import { NextRequest, NextResponse } from "next/server";

import { ADMIN_MUTATION_ALLOWED, requireRole } from "@/lib/rbac";
import { processFulfillmentJobs } from "@/lib/fulfillment";
import { supabaseAdmin } from "@/lib/supabase-admin";

const db = supabaseAdmin.schema("nexius_os");

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ADMIN_MUTATION_ALLOWED);
  if (!auth.ok) return auth.response;

  const body = (await req.json().catch(() => ({}))) as { jobId?: unknown; runWorker?: unknown };
  const jobId = String(body.jobId || "").trim();

  if (!jobId) return NextResponse.json({ ok: false, error: "jobId is required" }, { status: 400 });

  const { error } = await db
    .from("onboarding_jobs")
    .update({
      state: "payment_confirmed",
      error_code: null,
      error_message: null,
      error_stage: null,
      next_retry_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      updated_by: `admin:${auth.user.id}`,
      last_action: "admin_retry",
      last_action_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  await db.from("onboarding_job_events").insert({
    onboarding_job_id: jobId,
    state: "payment_confirmed",
    stage: "admin_retry",
    detail: { trigger: "admin_ui" },
    actor: `admin:${auth.user.id}`,
  });

  const shouldRun = body.runWorker !== false;
  const worker = shouldRun ? await processFulfillmentJobs(10) : { processed: 0, results: [] as unknown[] };

  return NextResponse.json({
    ok: true,
    jobId,
    worker,
  });
}
