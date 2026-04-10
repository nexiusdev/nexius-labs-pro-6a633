import { NextRequest, NextResponse } from "next/server";

import { syncOnboardingJobFromControl } from "@/lib/fulfillment";

function isAuthorized(req: NextRequest) {
  const configured =
    (process.env.NEXIUS_CONTROL_CALLBACK_TOKEN || "").trim() || (process.env.NEXIUS_CONTROL_ONBOARDING_TOKEN || "").trim();
  if (!configured) return false;

  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return token === configured;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const onboardingJobId = String(body.onboardingJobId || body.onboarding_job_id || "").trim();
  const customerId = String(body.customerId || body.customer_id || "").trim();
  const requestId = String(body.requestId || body.request_id || "").trim();

  try {
    const result = await syncOnboardingJobFromControl({
      onboardingJobId: onboardingJobId || undefined,
      customerId: customerId || undefined,
      requestId: requestId || undefined,
      responsePayload: body,
      actor: "system:control_callback",
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Control callback failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
