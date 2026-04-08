import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth-server";
import { getLatestJobForSubscriptionIds, getUserSubscriptions, mapStatus } from "@/lib/portal-data";
import { redactSensitive } from "@/lib/redaction";

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  try {
    const subscriptions = await getUserSubscriptions(userId);
    const subscriptionIds = subscriptions.map((sub) => String(sub.id));
    const jobs = await getLatestJobForSubscriptionIds(subscriptionIds);
    const jobBySubscription = new Map(jobs.map((job) => [String(job.subscription_id), job]));

    const installs = subscriptions.map((sub) => {
      const job = jobBySubscription.get(String(sub.id));
      const state = String(job?.state || "payment_confirmed");
      const responsePayload = job?.response_payload && typeof job.response_payload === "object"
        ? (job.response_payload as Record<string, unknown>)
        : {};
      const packagesRaw = Array.isArray(responsePayload.packages)
        ? responsePayload.packages
        : [];

      const packageSummaries = packagesRaw.map((pkg) => {
        const item = pkg as Record<string, unknown>;
        return {
          packageId: String(item.package_id || item.packageId || ""),
          state: String(item.state || item.status || "unknown"),
          stage: String(item.stage || ""),
          updatedAt: String(item.updated_at || item.updatedAt || job?.updated_at || ""),
        };
      });

      return {
        subscriptionId: String(sub.id),
        customerId: job?.customer_id ? String(job.customer_id) : null,
        state,
        status: mapStatus(state),
        retryCount: Number(job?.retry_count || 0),
        errorCode: job?.error_code ? String(job.error_code) : null,
        errorMessage: job?.error_message ? String(job.error_message) : null,
        provisionMode: job?.provision_mode ? String(job.provision_mode) : null,
        roleIds: Array.isArray(sub.role_ids) ? sub.role_ids.map((value: unknown) => String(value)) : [],
        packageIds: Array.isArray(sub.package_ids) ? sub.package_ids.map((value: unknown) => String(value)) : [],
        packageVersions: Array.isArray(sub.package_versions) ? sub.package_versions.map((value: unknown) => String(value)) : [],
        packageLifecycle: redactSensitive(packageSummaries),
        updatedAt: job?.updated_at ? String(job.updated_at) : sub.updated_at ? String(sub.updated_at) : null,
      };
    });

    return NextResponse.json({ ok: true, installs });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed" }, { status: 500 });
  }
}

export { POST } from "@/app/api/onboarding/telegram/route";
