import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth-server";
import { getLatestJobForSubscriptionIds, getUserSubscriptions, mapStatus } from "@/lib/portal-data";

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  try {
    const subscriptions = await getUserSubscriptions(userId);
    const jobs = await getLatestJobForSubscriptionIds(subscriptions.map((sub) => String(sub.id)));
    const jobBySubscription = new Map(jobs.map((job) => [String(job.subscription_id), job]));

    const packages = subscriptions.flatMap((sub) => {
      const packageIds = Array.isArray(sub.package_ids) ? sub.package_ids.map((value: unknown) => String(value)) : [];
      const packageVersions = Array.isArray(sub.package_versions)
        ? sub.package_versions.map((value: unknown) => String(value))
        : [];
      const state = String(jobBySubscription.get(String(sub.id))?.state || "payment_confirmed");

      return packageIds.map((packageId, idx) => ({
        subscriptionId: String(sub.id),
        packageId,
        packageVersion: packageVersions[idx] || packageVersions[0] || null,
        purchased: true,
        active: mapStatus(state) === "ready",
        status: mapStatus(state),
      }));
    });

    return NextResponse.json({ ok: true, packages });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed" }, { status: 500 });
  }
}
