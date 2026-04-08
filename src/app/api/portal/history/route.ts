import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth-server";
import { getPortalAuditHistory, getUserSubscriptions } from "@/lib/portal-data";
import { supabaseAdmin } from "@/lib/supabase-admin";

const db = supabaseAdmin.schema("nexius_os");

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const limit = Math.min(500, Math.max(1, Number(req.nextUrl.searchParams.get("limit") || "200")));

  try {
    const subscriptions = await getUserSubscriptions(userId);
    const subscriptionIds = subscriptions.map((sub) => String(sub.id));

    const jobsRes = subscriptionIds.length === 0
      ? { data: [], error: null }
      : await db
        .from("onboarding_jobs")
        .select("id")
        .in("subscription_id", subscriptionIds);
    if (jobsRes.error) throw new Error(jobsRes.error.message);

    const jobIds = (jobsRes.data || []).map((row) => String(row.id));
    const installEventsRes = jobIds.length === 0
      ? { data: [], error: null }
      : await db
        .from("onboarding_job_events")
        .select("id,onboarding_job_id,state,stage,detail,actor,created_at")
        .in("onboarding_job_id", jobIds)
        .order("created_at", { ascending: false })
        .limit(limit);
    if (installEventsRes.error) throw new Error(installEventsRes.error.message);

    const portalEvents = await getPortalAuditHistory(userId, limit);

    return NextResponse.json({
      ok: true,
      history: {
        installEvents: installEventsRes.data || [],
        portalEvents,
      },
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed" }, { status: 500 });
  }
}
