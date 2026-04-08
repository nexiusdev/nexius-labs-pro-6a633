"use client";

import { useEffect, useState } from "react";

import { getAuthHeaders } from "@/lib/auth-client";

export default function AdminClientDetailContent(props: { clientId: string }) {
  const { clientId } = props;
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`/api/admin/clients/${encodeURIComponent(clientId)}`, { headers, cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !json?.ok) throw new Error(json?.error || `Failed (${res.status})`);
        setDetail((json.detail || {}) as Record<string, unknown>);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  if (error) return <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>;
  if (!detail) return <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Loading client...</div>;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
      <pre className="overflow-auto text-xs text-slate-800">{JSON.stringify(detail, null, 2)}</pre>
    </div>
  );
}
