"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAuthHeaders } from "@/lib/auth-client";

type SubscriptionItem = {
  id: string;
  status: string;
  monthlyAmount: number;
  currency: string;
  billingStartsAt: string | null;
  roleIds: string[];
  createdAt: string | null;
  onboarding: {
    state: string;
    customer_id: string | null;
  } | null;
};

type ResponseShape = {
  ok: boolean;
  subscriptions?: SubscriptionItem[];
  error?: string;
};

export default function AccountSubscriptionsContent() {
  const router = useRouter();
  const [data, setData] = useState<ResponseShape | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/account/subscriptions", {
          headers,
          cache: "no-store",
        });
        const json = (await res.json().catch(() => ({}))) as ResponseShape;

        if (res.status === 401 || json.error === "Unauthorized") {
          const next = encodeURIComponent("/portal/billing");
          router.replace(`/auth?mode=signin&next=${next}`);
          return;
        }

        if (!cancelled) setData(json);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading subscriptions…</div>;
  }

  if (data?.error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
        {data.error}
      </div>
    );
  }

  const subscriptions = data?.subscriptions || [];
  if (subscriptions.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-900">No subscriptions yet</h2>
        <p className="mt-2 text-sm text-slate-500">Browse roles and start your first subscription when you are ready.</p>
        <Link
          href="/roles"
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Browse roles
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {subscriptions.map((subscription) => (
        <div key={subscription.id} className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Subscription {subscription.id}</h2>
              <p className="mt-1 text-sm text-slate-500">
                Status: <span className="font-semibold text-slate-700">{subscription.status}</span>
              </p>
            </div>
            <Link
              href={`/portal/onboarding?subscription=${encodeURIComponent(subscription.id)}`}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              View onboarding
            </Link>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div>
                Plan: <span className="font-mono">{subscription.currency} {subscription.monthlyAmount}/month</span>
              </div>
              <div>
                Billing starts: <span className="font-mono">{subscription.billingStartsAt || "-"}</span>
              </div>
              <div>
                Created: <span className="font-mono">{subscription.createdAt || "-"}</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div>
                Onboarding: <span className="font-semibold">{subscription.onboarding?.state || "not started"}</span>
              </div>
              <div>
                Customer ID: <span className="font-mono">{subscription.onboarding?.customer_id || "-"}</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-slate-700">Subscribed roles</p>
            <div className="flex flex-wrap gap-2">
              {subscription.roleIds.map((roleId) => (
                <span
                  key={roleId}
                  className="rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs text-slate-700"
                >
                  {roleId}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
