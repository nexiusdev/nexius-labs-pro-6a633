"use client";

import { useEffect, useState } from "react";
import { getAuthHeaders } from "@/lib/auth-client";
import TelegramOnboardingForm from "@/components/TelegramOnboardingForm";

type OnboardingStatusResponse = {
  ok: boolean;
  onboardingJob?: {
    id: string;
    customerId: string;
    state: string;
    idempotencyKey: string;
    requestId: string;
    errorCode: string | null;
    errorMessage: string | null;
    result: Record<string, unknown>;
  } | null;
  error?: string;
};

export default function OnboardingStatusCard(props: {
  subscriptionId: string;
  roleIds: string[];
  currency: string;
  monthlyTotal: number;
}) {
  const { subscriptionId, roleIds, currency, monthlyTotal } = props;
  const [data, setData] = useState<OnboardingStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      setLoading(true);
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`/api/onboarding/telegram?subscriptionId=${encodeURIComponent(subscriptionId)}`, {
          headers,
          cache: "no-store",
        });
        const json = (await res.json().catch(() => ({}))) as OnboardingStatusResponse;
        if (cancelled) return;
        setData(json);

        const state = json?.onboardingJob?.state || "";
        if (state === "queued" || state === "in_progress") {
          window.setTimeout(poll, 2500);
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
  }, [subscriptionId, refreshNonce]);

  const job = data?.onboardingJob;

  async function retryOnboarding() {
    setRetrying(true);
    try {
      const headers = await getAuthHeaders();
      await fetch("/api/onboarding/telegram", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...headers,
        },
        body: JSON.stringify({
          subscriptionId,
          retry: true,
        }),
      });
      setRefreshNonce((value) => value + 1);
    } finally {
      setRetrying(false);
    }
  }

  if (!job) {
    return (
      <TelegramOnboardingForm
        subscriptionId={subscriptionId}
        roleIds={roleIds}
        currency={currency}
        monthlyTotal={monthlyTotal}
        onCreated={() => setRefreshNonce((value) => value + 1)}
      />
    );
  }

  const resultAny = (job?.result || {}) as any;
  const botUsername = typeof resultAny.telegram_bot_username === "string"
    ? String(resultAny.telegram_bot_username)
    : typeof resultAny?.bot?.botUsername === "string"
      ? String(resultAny.bot.botUsername)
      : "";

  const telegramBotUrl = botUsername ? `https://t.me/${botUsername}` : "";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
      <h2 className="text-xl font-bold text-slate-900">Onboarding Status</h2>
      <p className="mt-2 text-sm text-slate-500">
        {loading ? "Checking onboarding status…" : "Latest onboarding status."}
      </p>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 space-y-1">
        <div>
          State: <span className="font-semibold">{job.state}</span>
        </div>
        <div>
          Customer ID: <span className="font-mono">{job.customerId}</span>
        </div>
        <div>
          Request ID: <span className="font-mono">{job.requestId}</span>
        </div>
        {job.state === "completed" && telegramBotUrl ? (
          <div>
            Message this bot to begin:{" "}
            <a
              className="font-mono text-emerald-700 hover:underline"
              href={telegramBotUrl}
              target="_blank"
              rel="noreferrer"
            >
              @{botUsername}
            </a>
          </div>
        ) : null}
      </div>

      {job.errorMessage ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {job.errorCode ? <div className="font-semibold">{job.errorCode}</div> : null}
          <div>{job.errorMessage}</div>
        </div>
      ) : null}

      {(job.state === "failed" || job.state === "queued") ? (
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={retryOnboarding}
            disabled={retrying}
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {retrying ? "Retrying…" : "Retry onboarding"}
          </button>
          <button
            type="button"
            onClick={() => setRefreshNonce((value) => value + 1)}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Refresh status
          </button>
        </div>
      ) : null}
    </div>
  );
}
