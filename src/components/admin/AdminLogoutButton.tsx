"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        try {
          setPending(true);
          await fetch("/api/admin/auth/logout", { method: "POST" });
        } finally {
          router.replace("/admin/login");
        }
      }}
      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-60"
    >
      {pending ? "Signing out..." : "Admin logout"}
    </button>
  );
}
