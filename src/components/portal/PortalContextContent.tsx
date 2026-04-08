"use client";

import { useEffect, useState } from "react";

import { getAuthHeaders } from "@/lib/auth-client";

export default function PortalContextContent() {
  const [businessContext, setBusinessContext] = useState("");
  const [operatingConstraints, setOperatingConstraints] = useState("");
  const [preferredTone, setPreferredTone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/portal/context", { headers, cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !json?.ok) throw new Error(json?.error || `Failed (${res.status})`);
        const ctx = (json.context || {}) as Record<string, unknown>;
        setBusinessContext(String(ctx.businessContext || ""));
        setOperatingConstraints(String(ctx.operatingConstraints || ""));
        setPreferredTone(String(ctx.preferredTone || ""));
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/portal/context", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          ...headers,
        },
        body: JSON.stringify({ businessContext, operatingConstraints, preferredTone }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) throw new Error(json?.error || `Save failed (${res.status})`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6 space-y-3">
      {error ? <div className="rounded border border-rose-200 bg-rose-50 p-2 text-xs text-rose-800">{error}</div> : null}
      <textarea value={businessContext} onChange={(e) => setBusinessContext(e.target.value)} placeholder="Business context" className="h-28 w-full rounded border border-slate-300 px-2 py-1.5 text-sm" />
      <textarea value={operatingConstraints} onChange={(e) => setOperatingConstraints(e.target.value)} placeholder="Operating constraints" className="h-28 w-full rounded border border-slate-300 px-2 py-1.5 text-sm" />
      <input value={preferredTone} onChange={(e) => setPreferredTone(e.target.value)} placeholder="Preferred tone" className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm" />
      <button onClick={save} disabled={saving} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-60">
        {saving ? "Saving..." : "Save Context"}
      </button>
    </div>
  );
}
