import { NextRequest, NextResponse } from "next/server";

import { processFulfillmentJobs } from "@/lib/fulfillment";

function isAuthorized(req: NextRequest) {
  const configured = (process.env.FULFILLMENT_WORKER_TOKEN || "").trim();
  if (!configured) return true;

  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return token === configured;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { limit?: unknown };
  const limit = Math.min(50, Math.max(1, Number(body.limit || 10)));

  try {
    const result = await processFulfillmentJobs(limit);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Dispatch failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
