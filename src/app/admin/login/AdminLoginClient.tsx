"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginClient() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#e2e8f0,transparent_30%),linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)] px-6 py-16">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur">
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Nexius Admin</div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Login</h1>
          <p className="text-sm text-slate-600">Use your dedicated admin credentials to access the internal control surface.</p>
        </div>

        <form
          className="mt-8 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setPending(true);
            setError(null);
            try {
              const res = await fetch("/api/admin/auth/login", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ username, password }),
              });
              const json = await res.json().catch(() => ({}));
              if (!res.ok || !json?.ok) throw new Error(json?.error || "Login failed");
              router.replace("/admin/dashboard");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Login failed");
            } finally {
              setPending(false);
            }
          }}
        >
          <label className="block space-y-1">
            <span className="text-sm font-medium text-slate-700">Username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-0"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-0"
            />
          </label>
          {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div> : null}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending ? "Signing in..." : "Sign in to admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
