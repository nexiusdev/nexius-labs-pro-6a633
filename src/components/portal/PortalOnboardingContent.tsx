"use client";

import { useEffect, useState } from "react";

import OnboardingStatusCard from "@/components/OnboardingStatusCard";
import { getAuthHeaders } from "@/lib/auth-client";

type Subscription = {
  id: string;
  roleIds: string[];
  currency: string;
  monthlyAmount: number;
};

export default function PortalOnboardingContent() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/account/subscriptions", { headers, cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !json?.ok) throw new Error(json?.error || `Failed (${res.status})`);

        const subs = Array.isArray(json.subscriptions) ? json.subscriptions : [];
        const active = subs.find((item) => String(item.status || "") === "active") || subs[0] || null;
        if (!active) {
          setSubscription(null);
          return;
        }

        setSubscription({
          id: String(active.id),
          roleIds: Array.isArray(active.roleIds) ? active.roleIds.map((value: unknown) => String(value)) : [],
          currency: String(active.currency || "SGD"),
          monthlyAmount: Number(active.monthlyAmount || 0),
        });
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
  if (!subscription) return <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">No subscription found.</div>;

  return (
    <OnboardingStatusCard
      subscriptionId={subscription.id}
      roleIds={subscription.roleIds}
      currency={subscription.currency}
      monthlyTotal={subscription.monthlyAmount}
    />
  );
}
