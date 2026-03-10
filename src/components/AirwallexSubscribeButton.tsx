"use client";

import { useState } from "react";
import { getAuthHeaders } from "@/lib/auth-client";

export default function AirwallexSubscribeButton(props: {
  roleIds: string[];
}) {
  const { roleIds } = props;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/billing/subscription/create", {
        method: "POST",
        headers: { "content-type": "application/json", ...headers },
        body: JSON.stringify({ roleIds }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || `Request failed (${res.status})`);

      const url = String(json?.checkoutUrl || "");
      if (!url) throw new Error("Missing checkoutUrl");
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        disabled={loading || roleIds.length === 0}
        onClick={start}
        className="w-full inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white px-5 py-3 rounded-lg text-sm font-semibold transition-colors"
      >
        {loading ? "Redirecting…" : "Set up subscription (billing starts immediately)"}
      </button>

      {error ? (
        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 text-sm">
          {error}
        </div>
      ) : null}
    </div>
  );
}
