"use client";

import { useEffect, useState } from "react";

import { getAuthHeaders } from "@/lib/auth-client";

type Summary = {
  pendingPayments: number;
  installsInProgress: number;
  failedJobs: number;
  incompleteOnboarding: number;
};

export default function AdminDashboardContent() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/admin/dashboard", { headers, cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !json?.ok) throw new Error(json?.error || `Failed (${res.status})`);
        setSummary(json.summary as Summary);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 text-sm">{error}</div>;
  if (!summary) return <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Loading dashboard...</div>;

  const cards = [
    ["Pending Payments", summary.pendingPayments],
    ["Installs In Progress", summary.installsInProgress],
    ["Failed Jobs", summary.failedJobs],
    ["Incomplete Onboarding", summary.incompleteOnboarding],
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map(([label, value]) => (
        <div key={String(label)} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">{label}</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{Number(value)}</div>
        </div>
      ))}
    </div>
  );
}
