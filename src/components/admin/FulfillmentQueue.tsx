"use client";

import { useCallback, useEffect, useState } from "react";

import { getAuthHeaders } from "@/lib/auth-client";
import { actionableErrorReason, formatFulfillmentStage } from "@/lib/fulfillment-status";

type Job = {
  id: string;
  customer_id: string;
  subscription_id: string;
  state: string;
  error_code: string | null;
  error_message: string | null;
  error_stage: string | null;
  retry_count: number;
  updated_at: string;
  request_payload?: Record<string, unknown>;
  response_payload?: Record<string, unknown>;
};

type JobsResponse = {
  ok: boolean;
  jobs?: Job[];
  error?: string;
};

export default function FulfillmentQueue() {
  const [stateFilter, setStateFilter] = useState("");
  const [ageMinutes, setAgeMinutes] = useState("0");
  const [errorStage, setErrorStage] = useState("");
  const [paymentEventId, setPaymentEventId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [busyJob, setBusyJob] = useState<string | null>(null);
  const [busyReplay, setBusyReplay] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (stateFilter) params.set("state", stateFilter);
      if (errorStage) params.set("error_stage", errorStage);
      if (ageMinutes !== "0") params.set("age_minutes", ageMinutes);

      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/fulfillment/jobs?${params.toString()}`, {
        headers,
        cache: "no-store",
      });
      const json = (await res.json().catch(() => ({}))) as JobsResponse;
      if (!res.ok || !json.ok) {
        throw new Error(json.error || `Request failed (${res.status})`);
      }

      setJobs(Array.isArray(json.jobs) ? json.jobs : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [ageMinutes, errorStage, stateFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function retryJob(jobId: string) {
    setBusyJob(jobId);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/admin/fulfillment/retry", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...headers,
        },
        body: JSON.stringify({ jobId, runWorker: true }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || `Retry failed (${res.status})`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Retry failed");
    } finally {
      setBusyJob(null);
    }
  }

  async function replayPaymentEvent() {
    const id = paymentEventId.trim();
    if (!id) return;

    setBusyReplay(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/admin/fulfillment/replay", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...headers,
        },
        body: JSON.stringify({ paymentEventId: id }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || `Replay failed (${res.status})`);
      setPaymentEventId("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Replay failed");
    } finally {
      setBusyReplay(false);
    }
  }

  async function packageRetry(jobId: string, packageId: string) {
    setBusyJob(jobId);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/admin/fulfillment/package-retry", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...headers,
        },
        body: JSON.stringify({ jobId, packageId, retryFromStep: "package.activate" }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || `Package retry failed (${res.status})`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Package retry failed");
    } finally {
      setBusyJob(null);
    }
  }

  async function packageRollback(jobId: string, packageId: string) {
    setBusyJob(jobId);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/admin/fulfillment/package-rollback", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...headers,
        },
        body: JSON.stringify({ jobId, packageId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || `Package rollback failed (${res.status})`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Package rollback failed");
    } finally {
      setBusyJob(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6 space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Queue Filters</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <input
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            placeholder="state (failed, in_progress...)"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            value={errorStage}
            onChange={(e) => setErrorStage(e.target.value)}
            placeholder="error stage"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            value={ageMinutes}
            onChange={(e) => setAgeMinutes(e.target.value)}
            placeholder="age minutes"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Refresh Queue
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6 space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">DLQ Replay</h2>
        <div className="flex gap-3">
          <input
            value={paymentEventId}
            onChange={(e) => setPaymentEventId(e.target.value)}
            placeholder="payment_event_id"
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={replayPaymentEvent}
            disabled={busyReplay}
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busyReplay ? "Replaying..." : "Replay Event"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Fulfillment Jobs</h2>
        <p className="mt-1 text-sm text-slate-500">Filter by state, age, and error stage. Retry is per job.</p>

        {loading ? <div className="mt-4 text-sm text-slate-500">Loading queue...</div> : null}

        {!loading && jobs.length === 0 ? (
          <div className="mt-4 text-sm text-slate-500">No jobs found for current filters.</div>
        ) : null}

        {!loading && jobs.length > 0 ? (
          <div className="mt-4 space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="rounded-xl border border-slate-200 p-4 text-sm">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-mono text-slate-900 break-all">{job.id}</div>
                    <div className="text-slate-600">state: <span className="font-semibold">{job.state}</span></div>
                  </div>
                  <button
                    type="button"
                    onClick={() => retryJob(job.id)}
                    disabled={busyJob === job.id}
                    className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    {busyJob === job.id ? "Retrying..." : "Retry Job"}
                  </button>
                </div>

                <div className="mt-3 grid gap-2 md:grid-cols-2 text-slate-600">
                  <div>customer: <span className="font-mono">{job.customer_id}</span></div>
                  <div>subscription: <span className="font-mono">{job.subscription_id}</span></div>
                  <div>retry_count: <span className="font-mono">{job.retry_count}</span></div>
                  <div>updated_at: <span className="font-mono">{job.updated_at}</span></div>
                  <div>error_stage: <span className="font-mono">{formatFulfillmentStage(job.error_stage)}</span></div>
                  <div>error_code: <span className="font-mono">{job.error_code || "-"}</span></div>
                </div>

                {job.error_message ? (
                  <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-800">
                    {job.error_message}
                    <div className="mt-1 text-xs">{actionableErrorReason(job.error_code)}</div>
                  </div>
                ) : null}

                {Array.isArray(job.response_payload?.packages) && job.response_payload?.packages.length ? (
                  <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="font-semibold text-slate-900 mb-2">Package Lifecycle</div>
                    <div className="space-y-2">
                      {(job.response_payload?.packages as Array<Record<string, unknown>>).map((pkg) => {
                        const packageId = String(pkg.package_id || "");
                        const state = String(pkg.state || pkg.status || "-");
                        const stage = String(pkg.stage || "-");
                        return (
                          <div key={`${job.id}-${packageId}`} className="rounded border border-slate-200 bg-white px-3 py-2">
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-mono text-slate-900">{packageId}</span>
                              <span className="text-slate-600">{state}</span>
                            </div>
                            <div className="mt-1 text-xs text-slate-500">stage: {stage}</div>
                            <div className="mt-2 flex gap-2">
                              <button
                                type="button"
                                onClick={() => packageRetry(job.id, packageId)}
                                disabled={busyJob === job.id}
                                className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 disabled:opacity-60"
                              >
                                Retry Package
                              </button>
                              <button
                                type="button"
                                onClick={() => packageRollback(job.id, packageId)}
                                disabled={busyJob === job.id}
                                className="inline-flex items-center justify-center rounded-lg border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-700 disabled:opacity-60"
                              >
                                Rollback Package
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
