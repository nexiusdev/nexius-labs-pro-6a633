"use client";

import { useEffect, useState } from "react";
import { getAuthHeaders } from "@/lib/auth-client";

export default function TelegramOnboardingForm(props: {
  subscriptionId: string;
  roleIds: string[];
  currency: string;
  monthlyTotal?: number;
  onCreated?: () => void;
}) {
  const { subscriptionId, roleIds, currency, monthlyTotal, onCreated } = props;

  const [fullName, setFullName] = useState("");
  const [telegramUserId, setTelegramUserId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "ok"; customerId: string; state: string }
    | { kind: "error"; message: string }
  >({ kind: "idle" });
  const [prefillLoading, setPrefillLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/account/profile", {
          headers,
          cache: "no-store",
        });
        const json = await res.json().catch(() => ({}));
        if (cancelled || !res.ok) return;
        if (typeof json?.profile?.fullName === "string") {
          setFullName(json.profile.fullName);
        }
        if (typeof json?.profile?.telegramUserId === "string") {
          setTelegramUserId(json.profile.telegramUserId);
        }
      } finally {
        if (!cancelled) setPrefillLoading(false);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ kind: "idle" });

    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/onboarding/telegram", {
        method: "POST",
        headers: { "content-type": "application/json", ...headers },
        body: JSON.stringify({
          subscriptionId,
          fullName,
          telegramUserId: telegramUserId.trim(),
          roleIds,
          currency,
          monthlyTotal,
          sourcePage: typeof window !== "undefined" ? window.location.href : null,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || `Request failed (${res.status})`);
      }

      setStatus({
        kind: "ok",
        customerId: String(json?.customerId || ""),
        state: String(json?.state || "queued"),
      });
      onCreated?.();
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-600">
          Roles: <span className="font-semibold text-slate-900">{roleIds.length}</span>
          {roleIds.length ? (
            <span className="text-slate-500"> ({roleIds.join(", ")})</span>
          ) : null}
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-800">Full name</label>
        <input
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
          placeholder="Your Name/ Business Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-800">Telegram User ID</label>
        <input
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
          placeholder="Your Telegram User ID"
          value={telegramUserId}
          onChange={(e) => setTelegramUserId(e.target.value)}
          required
        />

        <details className="mt-2">
          <summary className="cursor-pointer text-xs font-medium text-slate-600">
            Where do I find my Telegram User ID?
          </summary>
          <div className="mt-2 text-xs text-slate-600 leading-relaxed">
            Open Telegram and message <span className="font-mono">@userinfobot</span> (or <span className="font-mono">@myidbot</span>). It will reply with your numeric user id.
          </div>
        </details>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        Telegram bot assignment is handled internally after onboarding. You only need to provide your Telegram user ID.
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white px-5 py-3 rounded-lg text-sm font-semibold transition-colors"
      >
        {submitting ? "Submitting…" : prefillLoading ? "Loading profile…" : "Start onboarding"}
      </button>

      {status.kind === "ok" ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 text-sm">
          Onboarding job created for <span className="font-mono">{status.customerId || "customer"}</span>. Current state:{" "}
          <span className="font-semibold">{status.state}</span>.
        </div>
      ) : null}

      {status.kind === "error" ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 text-sm">
          {status.message}
        </div>
      ) : null}
    </form>
  );
}
