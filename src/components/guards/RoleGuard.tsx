"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getAuthHeaders } from "@/lib/auth-client";

type AppRole =
  | "super_admin"
  | "ops_admin"
  | "support_admin"
  | "read_only_admin"
  | "client_owner"
  | "client_operator"
  | "client_viewer";

export default function RoleGuard(props: {
  allowedRoles: AppRole[];
  fallbackPath?: string;
  children: React.ReactNode;
}) {
  const { allowedRoles, fallbackPath = "/auth?mode=signin", children } = props;
  const router = useRouter();
  const [state, setState] = useState<"loading" | "allowed" | "denied">("loading");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/account/profile", { headers, cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;

        if (!res.ok || !json?.ok) {
          setState("denied");
          router.replace(fallbackPath);
          return;
        }

        const role = String(json?.profile?.appRole || "");
        if (!allowedRoles.includes(role as AppRole)) {
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
  }, [allowedRoles, fallbackPath, router]);

  if (state !== "allowed") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Checking access...
      </div>
    );
  }

  return <>{children}</>;
}
