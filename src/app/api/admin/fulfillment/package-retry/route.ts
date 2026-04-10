import { NextRequest, NextResponse } from "next/server";

import { ADMIN_MUTATION_ALLOWED, requireRole } from "@/lib/rbac";
import { controlPackageRetry } from "@/lib/fulfillment";
import { supabaseAdmin } from "@/lib/supabase-admin";

const db = supabaseAdmin.schema("nexius_os");

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ADMIN_MUTATION_ALLOWED);
  if (!auth.ok) return auth.response;

  const body = (await req.json().catch(() => ({}))) as {
    jobId?: unknown;
    packageId?: unknown;
    retryFromStep?: unknown;
  };
  const jobId = String(body.jobId || "").trim();
  const packageId = String(body.packageId || "").trim();
  const retryFromStep = String(body.retryFromStep || "package.activate").trim() || "package.activate";
  if (!jobId) return NextResponse.json({ ok: false, error: "jobId is required" }, { status: 400 });
  if (!packageId) return NextResponse.json({ ok: false, error: "packageId is required" }, { status: 400 });

  const { data: job, error } = await db
    .from("onboarding_jobs")
    .select("id,request_payload")
    .eq("id", jobId)
    .single();
  if (error || !job) return NextResponse.json({ ok: false, error: error?.message || "Job not found" }, { status: 404 });

  const payload = job.request_payload && typeof job.request_payload === "object"
    ? { ...(job.request_payload as Record<string, unknown>) }
    : {};
  payload.packageIds = [packageId];

  const idempotencyKey = `admin-pkgretry-${jobId}-${packageId}-${Date.now()}`;
  const response = await controlPackageRetry({ payload, retryFromStep, idempotencyKey });

  await db.from("onboarding_job_events").insert({
    onboarding_job_id: jobId,
    state: "in_progress",
    stage: "admin_package_retry",
    detail: { packageId, retryFromStep },
    actor: `admin:${auth.user.id}`,
  });

  return NextResponse.json({ ok: true, jobId, packageId, retryFromStep, response });
}
