"use client";

import { useEffect, useState } from "react";

import { getAuthHeaders } from "@/lib/auth-client";

export default function PortalAgentContent() {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [responseStyle, setResponseStyle] = useState("");
  const [autoRegenerate, setAutoRegenerate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/portal/agent", { headers, cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !json?.ok) throw new Error(json?.error || `Failed (${res.status})`);
        const agent = (json.agent || {}) as Record<string, unknown>;
        setSystemPrompt(String(agent.systemPrompt || ""));
        setResponseStyle(String(agent.responseStyle || ""));
        setAutoRegenerate(agent.autoRegenerate === true);
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
      const res = await fetch("/api/portal/agent", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          ...headers,
        },
        body: JSON.stringify({ systemPrompt, responseStyle, autoRegenerate }),
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
      <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} placeholder="System prompt" className="h-36 w-full rounded border border-slate-300 px-2 py-1.5 text-sm" />
      <input value={responseStyle} onChange={(e) => setResponseStyle(e.target.value)} placeholder="Response style" className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm" />
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={autoRegenerate} onChange={(e) => setAutoRegenerate(e.target.checked)} />
        Auto-regenerate outputs when context changes
      </label>
      <button onClick={save} disabled={saving} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-60">
        {saving ? "Saving..." : "Save Agent Settings"}
      </button>
    </div>
  );
}
