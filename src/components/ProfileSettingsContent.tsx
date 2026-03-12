"use client";

import { useEffect, useState } from "react";
import { getAuthHeaders } from "@/lib/auth-client";

type ProfileResponse = {
  ok: boolean;
  profile?: {
    email: string;
    fullName: string;
    company: string;
    telegramUserId: string;
  };
  error?: string;
};

export default function ProfileSettingsContent() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [telegramUserId, setTelegramUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/account/profile", {
          headers,
          cache: "no-store",
        });
        const json = (await res.json().catch(() => ({}))) as ProfileResponse;
        if (cancelled) return;
        if (!res.ok || !json.profile) {
          setError(json.error || "Failed to load profile");
          return;
        }
        setEmail(json.profile.email);
        setFullName(json.profile.fullName);
        setCompany(json.profile.company);
        setTelegramUserId(json.profile.telegramUserId);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          ...headers,
        },
        body: JSON.stringify({
          fullName,
          company,
          telegramUserId,
          password,
        }),
      });

      const json = (await res.json().catch(() => ({}))) as ProfileResponse;
      if (!res.ok || !json.profile) {
        throw new Error(json.error || "Failed to update profile");
      }

      setEmail(json.profile.email);
      setPassword("");
      setMessage("Profile updated.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading profile…</div>;
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
      <h2 className="text-xl font-bold text-slate-900">Profile settings</h2>
      <p className="mt-2 text-sm text-slate-500">Update your account details used across billing and onboarding.</p>

      <div className="mt-6 grid gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-800">Email</label>
          <input
            value={email}
            disabled
            className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800">Full name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800">Company</label>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800">Telegram user ID</label>
          <input
            value={telegramUserId}
            onChange={(e) => setTelegramUserId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800">New password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
          />
        </div>
      </div>

      {message ? <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{message}</div> : null}
      {error ? <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div> : null}

      <button
        type="submit"
        disabled={saving}
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
