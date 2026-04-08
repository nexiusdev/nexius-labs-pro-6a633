"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getAuthHeaders } from "@/lib/auth-client";

type ClientRow = {
  customerId: string;
  subscriptionCount: number;
  statuses: string[];
  updatedAt: string | null;
};

export default function AdminClientsContent() {
  const [rows, setRows] = useState<ClientRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/admin/clients", { headers, cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !json?.ok) throw new Error(json?.error || `Failed (${res.status})`);
        setRows(Array.isArray(json.clients) ? json.clients : []);
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
      {rows.map((row) => (
        <div key={row.customerId} className="rounded-lg border border-slate-200 p-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="font-mono text-slate-900">{row.customerId}</div>
              <div className="text-slate-600">subscriptions: {row.subscriptionCount} | statuses: {row.statuses.join(", ")}</div>
            </div>
            <Link href={`/admin/clients/${encodeURIComponent(row.customerId)}`} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700">
              Open
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
