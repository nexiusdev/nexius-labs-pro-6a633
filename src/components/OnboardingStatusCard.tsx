"use client";

import { useEffect, useState } from "react";
import { getAuthHeaders } from "@/lib/auth-client";

type OnboardingTimelineItem = {
  state: string;
  stage: string | null;
  detail: Record<string, unknown>;
  createdAt: string | null;
};

type OnboardingStatusResponse = {
  ok: boolean;
  onboardingJob?: {
    id: string;
    customerId: string;
    state: string;
    idempotencyKey: string;
    requestId: string;
    errorCode: string | null;
    errorMessage: string | null;
    errorStage: string | null;
    retryCount: number;
    requestPayload: Record<string, unknown>;
    responsePayload: Record<string, unknown>;
    updatedAt: string | null;
  } | null;
  timeline?: OnboardingTimelineItem[];
  error?: string;
};

export default function OnboardingStatusCard(props: {
  subscriptionId: string;
  roleIds: string[];
  currency: string;
  monthlyTotal: number;
}) {
  const { subscriptionId } = props;

  const [data, setData] = useState<OnboardingStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [retrying, setRetrying] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      setLoading(true);
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`/api/onboarding/telegram?subscriptionId=${encodeURIComponent(subscriptionId)}`, {
          headers,
          cache: "no-store",
        });
        const json = (await res.json().catch(() => ({}))) as OnboardingStatusResponse;
        if (cancelled) return;
        setData(json);

        const state = json?.onboardingJob?.state || "";
        if (state === "payment_confirmed" || state === "package_resolved" || state === "tenant_request_sent" || state === "in_progress") {
          window.setTimeout(poll, 2500);
          return;
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [subscriptionId, refreshNonce]);

  const job = data?.onboardingJob;
  const timeline = data?.timeline || [];

  async function createOrRefreshJob(retry: boolean) {
    if (retry) setRetrying(true);
    else setCreating(true);

    try {
      const headers = await getAuthHeaders();
      await fetch("/api/onboarding/telegram", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...headers,
        },
        body: JSON.stringify({
          subscriptionId,
          retry,
        }),
      });
      setRefreshNonce((value) => value + 1);
    } finally {
      if (retry) setRetrying(false);
      else setCreating(false);
    }
  }

  if (!job) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
        <h2 className="text-xl font-bold text-slate-900">Install Timeline</h2>
        <p className="mt-2 text-sm text-slate-500">
          No fulfillment job is active yet for this subscription.
        </p>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          Click <span className="font-semibold">Start install</span> to enqueue provisioning for this paid plan.
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => createOrRefreshJob(false)}
            disabled={creating}
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {creating ? "Starting…" : "Start install"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
      <h2 className="text-xl font-bold text-slate-900">Install Timeline</h2>
      <p className="mt-2 text-sm text-slate-500">
        {loading ? "Checking install status…" : "Latest provisioning and onboarding lifecycle."}
      </p>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 space-y-1">
        <div>
          State: <span className="font-semibold">{job.state}</span>
        </div>
        <div>
          Customer ID: <span className="font-mono">{job.customerId}</span>
        </div>
        <div>
          Request ID: <span className="font-mono">{job.requestId}</span>
        </div>
        <div>
          Retry count: <span className="font-mono">{job.retryCount}</span>
        </div>
      </div>

      {timeline.length ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold text-slate-900">Timeline</div>
          <ul className="mt-3 space-y-2 text-sm">
            {timeline.map((item, idx) => (
              <li key={`${item.stage || item.state}-${idx}`} className="rounded-lg border border-slate-200 px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-slate-900">{item.stage || item.state}</span>
                  <span className="text-slate-500">{item.createdAt || "-"}</span>
                </div>
                <div className="mt-1 text-slate-600">State: {item.state}</div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {job.errorMessage ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {job.errorCode ? <div className="font-semibold">{job.errorCode}</div> : null}
          {job.errorStage ? <div className="font-mono text-xs mb-1">stage: {job.errorStage}</div> : null}
          <div>{job.errorMessage}</div>
          {(job.errorCode === "TENANT_ASSIGNMENT_NOT_FOUND" || job.errorCode === "TENANT_ALREADY_ASSIGNED") ? (
            <div className="mt-2 text-xs">
              This requires operator action in admin fulfillment queue before retry.
            </div>
          ) : null}
        </div>
      ) : null}

      {(job.state === "failed" || job.state === "payment_confirmed" || job.state === "package_resolved") ? (
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => createOrRefreshJob(true)}
            disabled={retrying}
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {retrying ? "Retrying…" : "Retry install"}
          </button>
          <button
            type="button"
            onClick={() => setRefreshNonce((value) => value + 1)}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Refresh status
          </button>
        </div>
      ) : null}
    </div>
  );
}
