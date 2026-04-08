"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getAuthHeaders } from "@/lib/auth-client";

type Payment = {
  id: string;
  status: string;
  provider_event_id: string;
  subscription_id: string | null;
  error_code: string | null;
  received_at: string;
};

export default function AdminPaymentsContent() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/admin/payments", { headers, cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) throw new Error(json?.error || `Failed (${res.status})`);
      setPayments(Array.isArray(json.payments) ? json.payments : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function action(paymentId: string, actionType: "reprocess" | "mark_duplicate") {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/admin/payments", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...headers,
      },
      body: JSON.stringify({ paymentId, action: actionType }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.ok) {
      setError(json?.error || `Action failed (${res.status})`);
      return;
    }
    await load();
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
      {error ? <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div> : null}
      <div className="space-y-3">
        {payments.map((p) => (
          <div key={p.id} className="rounded-lg border border-slate-200 p-3 text-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-mono text-slate-900 break-all">{p.id}</div>
                <div className="text-slate-600">status: <span className="font-semibold">{p.status}</span> | received: {p.received_at}</div>
                <div className="text-slate-500">event: {p.provider_event_id}</div>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/payments/${encodeURIComponent(p.id)}`} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700">
                  Open
                </Link>
                <button onClick={() => action(p.id, "reprocess")} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700">
                  Reprocess
                </button>
                <button onClick={() => action(p.id, "mark_duplicate")} className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700">
                  Mark Duplicate
                </button>
              </div>
            </div>
            {p.error_code ? <div className="mt-2 text-rose-700 text-xs">error_code: {p.error_code}</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
