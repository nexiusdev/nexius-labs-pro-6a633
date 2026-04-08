"use client";

import { useEffect, useState } from "react";
import { useCallback } from "react";

import { getAuthHeaders } from "@/lib/auth-client";

export default function AdminJobDetailContent(props: { jobId: string }) {
  const { jobId } = props;
  const [job, setJob] = useState<Record<string, unknown> | null>(null);
  const [events, setEvents] = useState<Array<Record<string, unknown>>>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/jobs/${encodeURIComponent(jobId)}`, { headers, cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) throw new Error(json?.error || `Failed (${res.status})`);
      setJob((json.job || {}) as Record<string, unknown>);
      setEvents(Array.isArray(json.events) ? json.events : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [jobId]);

  useEffect(() => {
    load();
  }, [load]);

  async function retryFromCurrent() {
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
    if (!res.ok || !json?.ok) {
      setError(json?.error || `Retry failed (${res.status})`);
      return;
    }
    await load();
  }

  function exportLogs() {
    const blob = new Blob([JSON.stringify({ job, events }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `job-${jobId}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (error) return <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>;
  if (!job) return <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Loading job...</div>;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
        <div className="flex gap-2">
          <button onClick={retryFromCurrent} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700">Retry From Stage</button>
          <button onClick={exportLogs} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700">Export Logs</button>
        </div>
        <pre className="mt-3 overflow-auto text-xs text-slate-800">{JSON.stringify(job, null, 2)}</pre>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
        <h2 className="font-semibold text-slate-900">Stage Timeline</h2>
        <div className="mt-3 space-y-2">
          {events.map((event, idx) => (
            <div key={`${String(event.id || idx)}`} className="rounded-lg border border-slate-200 p-3 text-xs">
              <div className="font-mono text-slate-900">{String(event.stage || event.state || "-")}</div>
              <div className="text-slate-500">{String(event.created_at || "")}</div>
              <pre className="mt-1 overflow-auto text-[11px] text-slate-700">{JSON.stringify(event.detail || {}, null, 2)}</pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
