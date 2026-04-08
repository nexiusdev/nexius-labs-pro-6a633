import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth-server";
import { getLatestJobForSubscriptionIds, getUserSubscriptions, mapStatus } from "@/lib/portal-data";

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  try {
    const subscriptions = await getUserSubscriptions(userId);
    const subscriptionIds = subscriptions.map((sub) => String(sub.id));
    const jobs = await getLatestJobForSubscriptionIds(subscriptionIds);
    const latest = jobs[0] || null;

    const installedScope = subscriptions.flatMap((sub) =>
      Array.isArray(sub.role_ids) ? sub.role_ids.map((value: unknown) => String(value)) : []
    );

    const onboardingState = latest?.state ? String(latest.state) : "payment_confirmed";

    return NextResponse.json({
      ok: true,
      workspace: {
        onboardingState,
        activationState: mapStatus(onboardingState),
        installedScope: [...new Set(installedScope)],
        latestJobId: latest?.id ? String(latest.id) : null,
        latestUpdatedAt: latest?.updated_at ? String(latest.updated_at) : null,
      },
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed" }, { status: 500 });
  }
}
