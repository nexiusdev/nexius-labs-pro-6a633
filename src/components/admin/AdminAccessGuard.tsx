"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminAccessGuard(props: { fallbackPath?: string; children: React.ReactNode }) {
  const { fallbackPath = "/admin/login", children } = props;
  const router = useRouter();
  const [state, setState] = useState<"loading" | "allowed" | "denied">("loading");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const res = await fetch("/api/admin/auth/session", { cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !json?.ok) {
          setState("denied");
          router.replace(fallbackPath);
          return;
        }
        setState("allowed");
      } catch {
        if (cancelled) return;
        setState("denied");
        router.replace(fallbackPath);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [fallbackPath, router]);

  if (state !== "allowed") {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Checking admin session...</div>;
  }

  return <>{children}</>;
}
