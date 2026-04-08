"use client";

import { useEffect, useState } from "react";

import { getAuthHeaders } from "@/lib/auth-client";

export default function AdminVpsContent() {
  const [jobs, setJobs] = useState<Array<Record<string, unknown>>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/admin/jobs?limit=200", { headers, cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !json?.ok) throw new Error(json?.error || `Failed (${res.status})`);
        setJobs(Array.isArray(json.jobs) ? json.jobs : []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
      <h2 className="font-semibold text-slate-900">Tenant Runtime Assignment Visibility</h2>
      <p className="mt-1 text-sm text-slate-500">Control-plane assignment model visibility (`assign_existing` and `create_new`).</p>
      <div className="mt-3 space-y-2">
        {jobs.map((job) => (
          <div key={String(job.id)} className="rounded border border-slate-200 p-2 text-xs">
            <div className="font-mono text-slate-900">{String(job.id)}</div>
            <div className="text-slate-600">customer: {String(job.customer_id || "")}</div>
            <div className="text-slate-600">state: {String(job.state || "")}</div>
            <div className="text-slate-600">provisionMode: {String(job.provision_mode || "-")}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
