"use client";

import Link from "next/link";

import AdminAccessGuard from "@/components/admin/AdminAccessGuard";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/jobs", label: "Jobs" },
  { href: "/admin/vps", label: "Assigned" },
  { href: "/admin/entitlements", label: "Entitlements" },
  { href: "/admin/audit", label: "Audit" },
];

export default function AdminShell(props: { title: string; children: React.ReactNode }) {
  return (
    <AdminAccessGuard fallbackPath="/admin/login">
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{props.title}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                {adminLinks.map((item) => (
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
            <AdminLogoutButton />
          </div>
        </div>
        {props.children}
      </div>
    </AdminAccessGuard>
  );
}
