"use client";

import { useState } from "react";

export default function TelegramOnboardingForm(props: {
  roleIds: string[];
  currency: string;
  monthlyTotal?: number;
}) {
  const { roleIds, currency, monthlyTotal } = props;

  const [fullName, setFullName] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [telegramBotToken, setTelegramBotToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "ok" }
    | { kind: "error"; message: string }
  >({ kind: "idle" });


  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ kind: "idle" });

    try {
      const res = await fetch("/api/onboarding/telegram", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fullName,
          telegramUsername: telegramUsername.trim(),
          telegramBotToken,
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

      setStatus({ kind: "ok" });
      setTelegramBotToken("");
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
          value={telegramUsername}
          onChange={(e) => setTelegramUsername(e.target.value)}
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

      <div>
        <label className="block text-sm font-semibold text-slate-800">Telegram bot token</label>
        <input
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 font-mono"
          placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
          value={telegramBotToken}
          onChange={(e) => setTelegramBotToken(e.target.value)}
          required
        />

        <details className="mt-2">
          <summary className="cursor-pointer text-xs font-medium text-slate-600">
            How do I create a bot and get the token?
          </summary>
          <div className="mt-2 text-xs text-slate-600 leading-relaxed">
            In Telegram, message <span className="font-mono">@BotFather</span> → run <span className="font-mono">/newbot</span> → follow the prompts → copy the token it gives you.
          </div>
        </details>

        <p className="text-xs text-slate-500 mt-2">
          Stored server-side. Don’t paste this in chat.
        </p>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white px-5 py-3 rounded-lg text-sm font-semibold transition-colors"
      >
        {submitting ? "Submitting…" : "Submit Telegram details"}
      </button>

      {status.kind === "ok" ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 text-sm">
          Submitted. We’ll proceed with provisioning.
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
