"use client";

import { useEffect, useState } from "react";

import { getAuthHeaders } from "@/lib/auth-client";

type TenantMapping = {
  tenant_id?: string | null;
  status?: string | null;
  updated_at?: string | null;
};

type Entitlement = {
  id: string;
  subscription_id?: string | null;
  role_id?: string | null;
  status?: string | null;
  package_id?: string | null;
  package_version?: string | null;
  contract_version?: string | null;
  updated_at?: string | null;
};

type Job = {
  id: string;
  subscription_id?: string | null;
  state?: string | null;
  error_code?: string | null;
  error_message?: string | null;
  error_stage?: string | null;
  retry_count?: number | null;
  provision_mode?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type Subscription = {
  id: string;
  user_id?: string | null;
  status?: string | null;
  monthly_amount?: number | null;
  currency?: string | null;
  role_ids?: string[] | null;
  provider_subscription_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type ClientDetail = {
  customerId: string;
  tenantMapping: TenantMapping | null;
  entitlements: Entitlement[];
  jobs: Job[];
  subscriptions: Subscription[];
  runtimeUrls?: {
    webchatUrl: string | null;
    erpUrl: string | null;
    source?: string | null;
  };
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatMoney(amount?: number | null, currency?: string | null) {
  if (amount == null) return "-";
  const code = String(currency || "USD").toUpperCase();
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${code} ${amount}`;
  }
}

export default function AdminClientDetailContent(props: { clientId: string }) {
  const { clientId } = props;
  const [detail, setDetail] = useState<ClientDetail | null>(null);
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
        setDetail((json.detail || {}) as ClientDetail);
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

  const activeSubscription = detail.subscriptions.find((item) => item.status === "active") || detail.subscriptions[0] || null;
  const latestJob = detail.jobs[0] || null;
  const activeEntitlements = detail.entitlements.filter((item) => item.status === "active").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Customer</div>
          <div className="mt-2 break-all text-sm font-semibold text-slate-900">{detail.customerId}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Assigned Tenant</div>
          <div className="mt-2 break-all text-sm font-semibold text-slate-900">{detail.tenantMapping?.tenant_id || "Not assigned"}</div>
          <div className="mt-1 text-xs text-slate-500">Status: {detail.tenantMapping?.status || "-"}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Latest Job</div>
          <div className="mt-2 text-sm font-semibold text-slate-900">{latestJob?.state || "No onboarding job"}</div>
          <div className="mt-1 text-xs text-slate-500">Updated: {formatDate(latestJob?.updated_at)}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Active Entitlements</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{activeEntitlements}</div>
          <div className="mt-1 text-xs text-slate-500">Total records: {detail.entitlements.length}</div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Subscriptions</h2>
              <p className="text-sm text-slate-500">Commercial status and linked provider records for this customer.</p>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.16em] text-slate-500">
                  <th className="px-3 py-2 font-semibold">Subscription</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                  <th className="px-3 py-2 font-semibold">Monthly</th>
                  <th className="px-3 py-2 font-semibold">Roles</th>
                  <th className="px-3 py-2 font-semibold">Provider</th>
                </tr>
              </thead>
              <tbody>
                {detail.subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-slate-500">No subscriptions linked to onboarding jobs.</td>
                  </tr>
                ) : (
                  detail.subscriptions.map((subscription) => (
                    <tr key={subscription.id} className="border-b border-slate-100 align-top">
                      <td className="px-3 py-3">
                        <div className="font-mono text-xs text-slate-800">{subscription.id}</div>
                        <div className="mt-1 text-xs text-slate-500">Updated {formatDate(subscription.updated_at)}</div>
                      </td>
                      <td className="px-3 py-3 text-slate-700">{subscription.status || "-"}</td>
                      <td className="px-3 py-3 text-slate-700">{formatMoney(subscription.monthly_amount, subscription.currency)}</td>
                      <td className="px-3 py-3 text-slate-700">{subscription.role_ids?.length ? subscription.role_ids.join(", ") : "-"}</td>
                      <td className="px-3 py-3">
                        <div className="font-mono text-xs text-slate-700">{subscription.provider_subscription_id || "-"}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
          <h2 className="text-lg font-semibold text-slate-900">Assigned Runtime</h2>
          <p className="text-sm text-slate-500">Current tenant or runtime assignment recorded by the website.</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Tenant ID</div>
              <div className="mt-2 break-all font-mono text-sm text-slate-900">{detail.tenantMapping?.tenant_id || "Not assigned yet"}</div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Mapping Status</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{detail.tenantMapping?.status || "-"}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Last Updated</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{formatDate(detail.tenantMapping?.updated_at)}</div>
              </div>
            </div>
            {activeSubscription ? (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-blue-700">Current Commercial Package</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{activeSubscription.status || "unknown"} subscription</div>
                <div className="mt-1 text-sm text-slate-600">{formatMoney(activeSubscription.monthly_amount, activeSubscription.currency)} monthly</div>
              </div>
            ) : null}
            {(detail.runtimeUrls?.webchatUrl || detail.runtimeUrls?.erpUrl) ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-emerald-700">Tenant URLs</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {detail.runtimeUrls?.webchatUrl ? (
                    <a
                      href={detail.runtimeUrls.webchatUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Open Webchat
                    </a>
                  ) : null}
                  {detail.runtimeUrls?.erpUrl ? (
                    <a
                      href={detail.runtimeUrls.erpUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-900"
                    >
                      Open ERP
                    </a>
                  ) : null}
                </div>
                <div className="mt-2 text-xs text-emerald-900">
                  Source: {detail.runtimeUrls?.source || "resolved"}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Entitlements</h2>
        <p className="text-sm text-slate-500">Role and package access currently granted to this customer.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.16em] text-slate-500">
                <th className="px-3 py-2 font-semibold">Role</th>
                <th className="px-3 py-2 font-semibold">Package</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Contract</th>
                <th className="px-3 py-2 font-semibold">Updated</th>
              </tr>
            </thead>
            <tbody>
              {detail.entitlements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-slate-500">No entitlement records found.</td>
                </tr>
              ) : (
                detail.entitlements.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="px-3 py-3 text-slate-800">{item.role_id || "-"}</td>
                    <td className="px-3 py-3 text-slate-700">
                      <div>{item.package_id || "-"}</div>
                      <div className="text-xs text-slate-500">{item.package_version || "-"}</div>
                    </td>
                    <td className="px-3 py-3 text-slate-700">{item.status || "-"}</td>
                    <td className="px-3 py-3 text-slate-700">{item.contract_version || "-"}</td>
                    <td className="px-3 py-3 text-slate-700">{formatDate(item.updated_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Onboarding Jobs</h2>
        <p className="text-sm text-slate-500">Provisioning attempts and current activation state for this customer.</p>
        <div className="mt-4 space-y-3">
          {detail.jobs.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No onboarding jobs found.</div>
          ) : (
            detail.jobs.map((job) => (
              <div key={job.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-xs text-slate-700">{job.id}</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">{job.state || "-"}</div>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <div>Updated {formatDate(job.updated_at)}</div>
                    <div>Created {formatDate(job.created_at)}</div>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Provision</div>
                    <div className="mt-1 text-sm text-slate-800">{job.provision_mode || "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Retry Count</div>
                    <div className="mt-1 text-sm text-slate-800">{job.retry_count ?? 0}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Error Code</div>
                    <div className="mt-1 text-sm text-slate-800">{job.error_code || "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Error Stage</div>
                    <div className="mt-1 text-sm text-slate-800">{job.error_stage || "-"}</div>
                  </div>
                </div>
                {job.error_message ? (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    {job.error_message}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
