"use client";

import { useEffect, useState } from "react";

import { getAuthHeaders } from "@/lib/auth-client";

type Entitlement = {
  id: string;
  customer_id: string;
  subscription_id: string;
  role_id: string;
  status: string;
  package_id: string | null;
  package_version: string | null;
};

export default function AdminEntitlementsContent() {
  const [rows, setRows] = useState<Entitlement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ customerId: "", subscriptionId: "", roleId: "", packageId: "", packageVersion: "" });

  async function load() {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/admin/entitlements", { headers, cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) throw new Error(json?.error || `Failed (${res.status})`);
      setRows(Array.isArray(json.entitlements) ? json.entitlements : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function mutate(action: "add" | "revoke") {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/admin/entitlements", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...headers,
      },
      body: JSON.stringify({ action, ...form }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.ok) {
      setError(json?.error || `Action failed (${res.status})`);
      return;
    }
    await load();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6 space-y-3">
        {error ? <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div> : null}
        <h2 className="font-semibold text-slate-900">Entitlement Actions</h2>
        <div className="grid gap-2 md:grid-cols-5">
          <input placeholder="customer_id" value={form.customerId} onChange={(e) => setForm((v) => ({ ...v, customerId: e.target.value }))} className="rounded border border-slate-300 px-2 py-1.5 text-xs" />
          <input placeholder="subscription_id" value={form.subscriptionId} onChange={(e) => setForm((v) => ({ ...v, subscriptionId: e.target.value }))} className="rounded border border-slate-300 px-2 py-1.5 text-xs" />
          <input placeholder="role_id" value={form.roleId} onChange={(e) => setForm((v) => ({ ...v, roleId: e.target.value }))} className="rounded border border-slate-300 px-2 py-1.5 text-xs" />
          <input placeholder="package_id" value={form.packageId} onChange={(e) => setForm((v) => ({ ...v, packageId: e.target.value }))} className="rounded border border-slate-300 px-2 py-1.5 text-xs" />
          <input placeholder="package_version" value={form.packageVersion} onChange={(e) => setForm((v) => ({ ...v, packageVersion: e.target.value }))} className="rounded border border-slate-300 px-2 py-1.5 text-xs" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => mutate("add")} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700">Add Entitlement</button>
          <button onClick={() => mutate("revoke")} className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700">Revoke Entitlement</button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6 space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="rounded border border-slate-200 p-2 text-xs">
            <div className="font-mono text-slate-900">{row.customer_id}</div>
            <div className="text-slate-600">{row.role_id} | {row.status} | {row.package_id || "-"}@{row.package_version || "-"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
