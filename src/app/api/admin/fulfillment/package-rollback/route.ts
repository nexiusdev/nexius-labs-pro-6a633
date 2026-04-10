import { NextRequest, NextResponse } from "next/server";

import { ADMIN_MUTATION_ALLOWED, requireRole } from "@/lib/rbac";
import { controlPackageRollback } from "@/lib/fulfillment";
import { supabaseAdmin } from "@/lib/supabase-admin";

const db = supabaseAdmin.schema("nexius_os");

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ADMIN_MUTATION_ALLOWED);
  if (!auth.ok) return auth.response;

  const body = (await req.json().catch(() => ({}))) as {
    jobId?: unknown;
    packageId?: unknown;
  };
  const jobId = String(body.jobId || "").trim();
  const packageId = String(body.packageId || "").trim();
  if (!jobId) return NextResponse.json({ ok: false, error: "jobId is required" }, { status: 400 });
  if (!packageId) return NextResponse.json({ ok: false, error: "packageId is required" }, { status: 400 });

  const { data: job, error } = await db
    .from("onboarding_jobs")
    .select("id,customer_id")
    .eq("id", jobId)
    .single();
  if (error || !job) return NextResponse.json({ ok: false, error: error?.message || "Job not found" }, { status: 404 });

  const customerId = String(job.customer_id || "").trim();
  if (!customerId) return NextResponse.json({ ok: false, error: "Job missing customer_id" }, { status: 422 });

  const response = await controlPackageRollback({ customerId, packageId });

  await db.from("onboarding_job_events").insert({
    onboarding_job_id: jobId,
    state: "in_progress",
    stage: "admin_package_rollback",
    detail: { packageId },
    actor: `admin:${auth.user.id}`,
  });

  return NextResponse.json({ ok: true, jobId, customerId, packageId, response });
}
