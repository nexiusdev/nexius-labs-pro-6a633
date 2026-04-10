"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getAuthHeaders } from "@/lib/auth-client";
import { hasRuntimeUrls } from "@/lib/runtime-url-ui";

type ActivationState = "ready" | "installing" | "needs_action";

type WorkspaceState = {
  onboardingState?: string;
  activationState?: ActivationState;
  installedScope?: string[];
  customerId?: string | null;
  urls?: {
    webchatUrl: string | null;
    erpUrl: string | null;
    source?: string | null;
  };
  latestJobId?: string | null;
  latestUpdatedAt?: string | null;
};

function activationBadgeClasses(state: ActivationState) {
  if (state === "ready") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (state === "installing") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-rose-200 bg-rose-50 text-rose-700";
}

function onboardingLabel(state: string) {
  if (state === "payment_confirmed") return "Payment confirmed";
  if (state === "package_resolved") return "Package resolved";
  if (state === "tenant_request_sent") return "Tenant request sent";
  if (state === "in_progress") return "Provisioning in progress";
  if (state === "completed") return "Completed";
  if (state === "failed") return "Failed";
  return state || "Unknown";
}

function activationLabel(state: ActivationState) {
  if (state === "ready") return "Ready";
  if (state === "installing") return "Installing";
  return "Needs action";
}

export default function PortalWorkspaceContent() {
  const [workspace, setWorkspace] = useState<WorkspaceState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/portal/workspace", { headers, cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !json?.ok) throw new Error(json?.error || `Failed (${res.status})`);
        setWorkspace((json.workspace || {}) as WorkspaceState);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>;
  if (!workspace) return <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Loading workspace...</div>;

  const onboardingState = String(workspace.onboardingState || "unknown");
  const activationState = (workspace.activationState || "needs_action") as ActivationState;
  const installedScope = Array.isArray(workspace.installedScope)
    ? workspace.installedScope.map((value) => String(value))
    : [];

  const showAction = activationState !== "ready";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Workspace Status</h2>
            <p className="mt-1 text-sm text-slate-500">Live activation summary for your current subscription.</p>
          </div>
          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${activationBadgeClasses(activationState)}`}>
            {activationLabel(activationState)}
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <div>
              Onboarding stage: <span className="font-semibold text-slate-900">{onboardingLabel(onboardingState)}</span>
            </div>
            <div className="mt-1">
              Job ID: <span className="font-mono text-xs">{workspace.latestJobId || "-"}</span>
            </div>
            <div className="mt-1">
              Last updated: <span className="font-mono text-xs">{workspace.latestUpdatedAt || "-"}</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <div className="font-semibold text-slate-900">Installed Scope</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {installedScope.length > 0 ? (
                installedScope.map((scopeId) => (
                  <span key={scopeId} className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700">
                    {scopeId}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">No scope active yet.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAction ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 md:p-6">
          <h3 className="text-sm font-semibold text-amber-900">Action Recommended</h3>
          <p className="mt-1 text-sm text-amber-800">
            Your workspace is not fully active yet. Open the onboarding timeline to review status and retry if needed.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/portal/onboarding"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Open Onboarding
            </Link>
            <Link
              href="/portal/packages"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              View Packages
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 md:p-6">
          <h3 className="text-sm font-semibold text-emerald-900">Workspace Ready</h3>
          <p className="mt-1 text-sm text-emerald-800">
            Your environment is active. Manage context and agent settings from the portal navigation.
          </p>
          {hasRuntimeUrls(workspace.urls || null) ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {workspace.urls?.webchatUrl ? (
                <a
                  href={workspace.urls.webchatUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
                >
                  Open Webchat
                </a>
              ) : null}
              {workspace.urls?.erpUrl ? (
                <a
                  href={workspace.urls.erpUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-900"
                >
                  Open ERP
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
