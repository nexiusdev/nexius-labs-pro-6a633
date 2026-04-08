"use client";

import { useEffect, useState } from "react";

import { getAuthHeaders } from "@/lib/auth-client";

export default function AdminAuditContent() {
  const [events, setEvents] = useState<Array<Record<string, unknown>>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/admin/audit", { headers, cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !json?.ok) throw new Error(json?.error || `Failed (${res.status})`);
        setEvents(Array.isArray(json.events) ? json.events : []);
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
      {events.map((event) => (
        <div key={String(event.id)} className="rounded border border-slate-200 p-2 text-xs">
          <div className="font-mono text-slate-900">{String(event.stage || event.event_type || "event")}</div>
          <div className="text-slate-500">{String(event.created_at || "")}</div>
          <pre className="mt-1 overflow-auto text-[11px] text-slate-700">{JSON.stringify(event.detail || event.payload || {}, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
}
