"use client";

import { useEffect, useMemo, useState } from "react";
import { getAuthHeaders } from "@/lib/auth-client";
import OnboardingStatusCard from "@/components/OnboardingStatusCard";

type StatusResp = {
  ok: boolean;
  subscription?: {
    id: string;
    status: string;
    monthlyAmount: number;
    currency: string;
    billingStartsAt: string | null;
    roleIds: string[];
  };
  error?: string;
};

export default function SubscriptionStatusCard(props: { subscriptionId: string }) {
  const { subscriptionId } = props;
  const [data, setData] = useState<StatusResp | null>(null);
  const [loading, setLoading] = useState(true);

  const title = useMemo(() => {
    const st = data?.subscription?.status;
    if (!st) return "Checking subscription…";
    if (st === "active") return "Subscription active";
    if (st === "initiated") return "Subscription pending";
    if (st === "past_due") return "Payment failed (past due)";
    if (st === "cancelled") return "Subscription cancelled";
    return `Subscription: ${st}`;
  }, [data?.subscription?.status]);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      setLoading(true);
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`/api/billing/subscription/status?id=${encodeURIComponent(subscriptionId)}`, {
          headers,
          cache: "no-store",
        });
        const json = (await res.json().catch(() => ({}))) as StatusResp;
        if (!cancelled) setData(json);

        // Poll briefly if still initiated.
        const st = json?.subscription?.status;
        if (!cancelled && (st === "initiated" || !st) ) {
          setTimeout(poll, 2500);
          return;
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [subscriptionId]);

  const sub = data?.subscription;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{title}</h1>
      <p className="text-slate-500 mt-2">
        {loading ? "This may take a few seconds. You can keep this page open." : ""}
      </p>

      {data?.error ? (
        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 text-sm space-y-2">
          <div>{data.error}</div>
          {data.error.toLowerCase().includes("unauthorized") ? (
            <a
              className="inline-flex items-center justify-center rounded-lg bg-rose-700 px-3 py-2 text-white text-xs font-semibold"
              href={`/auth?mode=signin&next=${encodeURIComponent(`/payment/success?subscription=${subscriptionId}`)}`}
            >
              Sign in to view subscription
            </a>
          ) : null}
        </div>
      ) : null}

      {sub ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 space-y-1">
          <div>
            Status: <span className="font-semibold">{sub.status}</span>
          </div>
          <div>
            Billing starts: <span className="font-mono">{sub.billingStartsAt ?? "-"}</span>
          </div>
          <div>
            Plan: <span className="font-mono">{sub.currency} {sub.monthlyAmount}/month</span>
          </div>
          <div>
            Roles: <span className="font-mono">{sub.roleIds.join(",") || "-"}</span>
          </div>
        </div>
      ) : null}

      {sub?.status === "active" ? (
        <div className="mt-6">
          <OnboardingStatusCard
            subscriptionId={sub.id}
            roleIds={sub.roleIds}
            currency={sub.currency}
            monthlyTotal={sub.monthlyAmount}
          />
        </div>
      ) : null}

      <p className="text-xs text-slate-500 mt-6">
        If this looks wrong, contact support and include Subscription ID: <span className="font-mono">{subscriptionId}</span>
      </p>
    </div>
  );
}
