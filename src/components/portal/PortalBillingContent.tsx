"use client";

import { useEffect, useState } from "react";

import { getAuthHeaders } from "@/lib/auth-client";

export default function PortalBillingContent() {
  const [subscriptions, setSubscriptions] = useState<Array<Record<string, unknown>>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/account/subscriptions", { headers, cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !json?.ok) throw new Error(json?.error || `Failed (${res.status})`);
        setSubscriptions(Array.isArray(json.subscriptions) ? json.subscriptions : []);
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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6 space-y-2">
      {subscriptions.map((sub) => (
        <div key={String(sub.id)} className="rounded border border-slate-200 p-2 text-xs">
          <div className="font-mono text-slate-900">{String(sub.id)}</div>
          <div className="text-slate-600">status: {String(sub.status || "")}</div>
          <div className="text-slate-600">plan: {String(sub.currency || "SGD")} {String(sub.monthlyAmount || 0)}/month</div>
        </div>
      ))}
    </div>
  );
}
