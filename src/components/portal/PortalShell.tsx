"use client";

import Link from "next/link";

import RoleGuard from "@/components/guards/RoleGuard";

const portalLinks = [
  { href: "/portal/workspace", label: "Workspace" },
  { href: "/portal/packages", label: "Packages" },
  { href: "/portal/context", label: "Context" },
  { href: "/portal/agent", label: "Agent" },
  { href: "/portal/onboarding", label: "Onboarding" },
  { href: "/portal/history", label: "History" },
  { href: "/portal/billing", label: "Billing" },
];

export default function PortalShell(props: { title: string; children: React.ReactNode }) {
  return (
    <RoleGuard
      allowedRoles={["client_owner", "client_operator", "client_viewer", "super_admin", "ops_admin", "support_admin", "read_only_admin"]}
      fallbackPath="/auth?mode=signin"
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
          <h1 className="text-2xl font-bold text-slate-900">{props.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            {portalLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        {props.children}
      </div>
    </RoleGuard>
  );
}
