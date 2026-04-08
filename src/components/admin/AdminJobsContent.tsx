"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getAuthHeaders } from "@/lib/auth-client";

type JobRow = {
  id: string;
  customer_id: string;
  state: string;
  error_code: string | null;
  retry_count: number;
  updated_at: string;
};

export default function AdminJobsContent() {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/admin/jobs", { headers, cache: "no-store" });
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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6 space-y-3">
      {jobs.map((job) => (
        <div key={job.id} className="rounded-lg border border-slate-200 p-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="font-mono text-slate-900 break-all">{job.id}</div>
              <div className="text-slate-600">state: {job.state} | retry: {job.retry_count} | customer: {job.customer_id}</div>
              {job.error_code ? <div className="text-rose-700 text-xs">{job.error_code}</div> : null}
            </div>
            <Link href={`/admin/jobs/${encodeURIComponent(job.id)}`} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700">
              Open
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
