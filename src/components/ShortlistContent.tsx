"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { useShortlist } from "@/context/ShortlistContext";
import { workflowColors, type Role, type System } from "@/data/roles";
import type { Expert } from "@/data/experts";
import RoleCard from "@/components/RoleCard";
import { buildPaymentLink, formatSgd, getRolePricing } from "@/lib/pricing";

export default function ShortlistContent() {
  const { ids, remove } = useShortlist();
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [expertByRole, setExpertByRole] = useState<Record<string, Expert>>({});

  useEffect(() => {
    fetch("/api/catalog/roles")
      .then((r) => r.json())
      .then((json) => {
        setAllRoles(Array.isArray(json?.roles) ? json.roles : []);
        setExpertByRole(json?.expertByRole ?? {});
      })
      .catch(() => {});
  }, []);

  const roleMap = useMemo(() => Object.fromEntries(allRoles.map((r) => [r.id, r])), [allRoles]);
  const shortlistedRoles = ids.map((id) => roleMap[id]).filter(Boolean);

  const pricingTotals = shortlistedRoles.reduce(
    (acc, role) => {
      const p = getRolePricing(role as Role);
      acc.monthly += p.monthlySgd;
            return acc;
    },
    { monthly: 0 }
  );

  const paymentLink = buildPaymentLink({
    roleIds: shortlistedRoles.map((r) => r.id),
    totalMonthlySgd: pricingTotals.monthly,
  });

  const totalFunctions = shortlistedRoles.reduce((sum, r) => sum + (r?.functionCount ?? 0), 0);
  const totalSkills = shortlistedRoles.reduce(
    (sum, r) => sum + (r?.functions.reduce((s, f) => s + f.skills.length, 0) ?? 0),
    0
  );
  const coveredWorkflows = [...new Set(shortlistedRoles.map((r) => r?.workflow))];
  const approvalPct = shortlistedRoles.length
    ? Math.round(
        (shortlistedRoles.filter((r) => r?.governance === "Approval Required").length /
          shortlistedRoles.length) *
          100
      )
    : 0;

  // Projected metrics based on count
  const n = shortlistedRoles.length;
  const timeSaved = n * 40;
  const errorReduction = Math.min(n * 15, 85);
  const cycleCompression = Math.min(n * 12, 70);
  const cashUplift = Math.min(n * 8, 45);

  // Recommended roles: same workflow or shared systems, not already shortlisted
  const shortlistedIds = new Set(ids);
  const shortlistedWorkflows = new Set(shortlistedRoles.map((r) => r?.workflow));
  const shortlistedSystems = new Set(
    shortlistedRoles.flatMap((r) => r?.systems ?? [])
  );

  const recommended = n > 0
    ? allRoles
        .filter((r) => !shortlistedIds.has(r.id))
        .map((r) => {
          let score = 0;
          if (shortlistedWorkflows.has(r.workflow)) score += 3;
          const sharedSystems = r.systems.filter((s) => shortlistedSystems.has(s as System));
          score += sharedSystems.length;
          return { role: r, score };
        })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map((r) => r.role)
    : [];

  return (
    <>
    <div className="lg:grid lg:grid-cols-3 lg:gap-8">
      {/* ── Left column (2/3) ── */}
      <div className="lg:col-span-2">
        {shortlistedRoles.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 mt-8">
            <p className="text-slate-500 text-lg">No roles in your cart yet.</p>
            <p className="text-slate-400 mt-2">
              Browse roles, shortlist the best fit, then return here to finalize your deployment mix.
            </p>
            <Link
              href="/roles"
              className="mt-4 inline-flex items-center bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-lg font-semibold transition-colors text-sm uppercase tracking-wide"
            >
              Explore Roles
            </Link>
          </div>
        ) : (
          <div className="space-y-4 mt-8">
            {shortlistedRoles.map((role) => {
              if (!role) return null;
              const colors = workflowColors[role.workflow];
              return (
                <div
                  key={role.id}
                  className={`bg-white rounded-xl border border-slate-100 border-l-4 ${colors.border} p-5 flex items-start gap-4`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
                        {role.workflow}
                      </span>
                      <span className="text-xs text-slate-400">{role.governance}</span>
                    </div>
                    <Link
                      href={`/roles/${role.id}`}
                      className="text-lg font-semibold text-slate-900 hover:text-blue-600 transition-colors mt-1 block"
                    >
                      {role.title}
                    </Link>
                    <p className="text-sm text-slate-500 mt-1">{role.description}</p>
                    <p className="text-sm font-medium text-slate-800 mt-2">
                      {formatSgd(getRolePricing(role).monthlySgd)}/month 
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400">
                      <span>{role.functionCount} functions</span>
                      <span>{role.functions.reduce((s, f) => s + f.skills.length, 0)} skills</span>
                      <span>Time-to-value: {role.timeToValue}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => remove(role.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-2 shrink-0"
                    aria-label={`Remove ${role.title} from shortlist`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Right column: Cart Summary (1/3) ── */}
      <div className="mt-8 lg:mt-0">
        <div className="bg-white rounded-xl border-l-4 border-blue-500 border border-slate-100 p-6 sticky top-24">
          <h2 className="text-xl font-bold text-slate-900">Cart Summary</h2>

          <div className="mt-4 space-y-3 text-sm">
            <p className="text-slate-600">
              Total roles: <span className="font-semibold text-slate-900">{n}</span>
            </p>
            <p className="text-slate-600">
              Monthly total: <span className="font-semibold text-slate-900">{formatSgd(pricingTotals.monthly)}</span>
            </p>
            <p className="text-slate-600">
              Workflows:{" "}
              <span className="font-semibold text-slate-900">
                {coveredWorkflows.length > 0 ? coveredWorkflows.join(", ") : "None yet"}
              </span>
            </p>
            <p className="text-slate-600">
              Functions: <span className="font-semibold text-slate-900">{totalFunctions}</span>
            </p>
            <p className="text-slate-600">
              Skills: <span className="font-semibold text-slate-900">{totalSkills}</span>
            </p>
            <p className="text-slate-600">
              Approval controls:{" "}
              <span className="font-semibold text-slate-900">{approvalPct}%</span>
            </p>
          </div>

          {/* Projected Operational Metrics */}
          <div className="mt-6 border border-slate-200 rounded-lg p-4">
            <h3 className="font-bold text-slate-900 text-sm">Projected Operational Metrics</h3>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="border border-slate-100 rounded-lg p-3">
                <p className="text-lg font-bold text-slate-900">{timeSaved} hrs/mo</p>
                <p className="text-xs text-slate-500">Estimated time saved</p>
              </div>
              <div className="border border-slate-100 rounded-lg p-3">
                <p className="text-lg font-bold text-slate-900">{errorReduction}%</p>
                <p className="text-xs text-slate-500">Manual error reduction</p>
              </div>
              <div className="border border-slate-100 rounded-lg p-3">
                <p className="text-lg font-bold text-slate-900">{cycleCompression}%</p>
                <p className="text-xs text-slate-500">Cycle-time compression</p>
              </div>
              <div className="border border-slate-100 rounded-lg p-3">
                <p className="text-lg font-bold text-slate-900">{cashUplift}%</p>
                <p className="text-xs text-slate-500">Cash conversion uplift</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-4 leading-relaxed">
            Recommended next step: validate 1 starter role in a controlled pilot, then expand by
            workflow family.
          </p>

          <div className="mt-4 space-y-3">
            <Link
              href="/#contact"
              className="w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-lg font-semibold transition-colors text-sm uppercase tracking-wide"
            >
              Book Free Consultation
            </Link>
            <Link
              href={paymentLink}
              className="w-full inline-flex items-center justify-center border-2 border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-800 px-5 py-3 rounded-lg font-semibold transition-colors text-sm uppercase tracking-wide"
            >
              Proceed to Payment
            </Link>
          </div>
        </div>
      </div>
    </div>

    {/* ── Recommended Roles ── */}
    {recommended.length > 0 && (
      <section className="mt-16">
        <div className="text-center mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Expand Your Team
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">
            Recommended Roles
          </h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto text-base leading-relaxed">
            Based on your shortlisted workflows and systems, these roles complement your deployment and maximize operational coverage.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommended.map((role) => (
            <RoleCard key={role.id} role={role} expert={expertByRole[role.id]} />
          ))}
        </div>
      </section>
    )}
    </>
  );
}


