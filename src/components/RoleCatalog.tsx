"use client";

import { useState, useMemo, useEffect } from "react";
import {
  workflows,
  governanceOptions,
  complexityOptions,
  timeToValueOptions,
  outcomeCategoryOptions,
  type FilterState,
  type Role,
} from "@/data/roles";
import type { Expert } from "@/data/experts";
import Link from "next/link";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import RoleCard from "@/components/RoleCard";

function CustomRoleCTA() {
  return (
    <div className="col-span-full">
      <AnimateOnScroll animation="fade-up">
        <div className="text-center bg-white rounded-2xl border border-slate-200 p-10 md:p-14">
          <h3 className="text-2xl font-bold text-slate-900">
            Don&apos;t see what you need?
          </h3>
          <p className="text-slate-500 mt-3 max-w-lg mx-auto text-base">
            We build custom roles for your specific workflows. Tell us the
            process you want to automate and we&apos;ll design an AI agent
            around it.
          </p>
          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-slate-900 text-white text-sm font-medium rounded-full hover:bg-slate-800 transition-colors"
          >
            Contact Us
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </AnimateOnScroll>
    </div>
  );
}

const connectedSystemsByCategory = {
  // Platforms with practical integration routes available via API, MCP connector, or CLI tooling.
  ATS: [
    "Greenhouse",
    "Lever",
    "Workable",
    "SmartRecruiters",
    "iCIMS",
    "Ashby",
    "Jobvite",
    "Teamtailor",
  ],
  CRM: [
    "Salesforce",
    "HubSpot",
    "Zoho CRM",
    "Pipedrive",
    "Microsoft Dynamics 365",
    "Freshsales",
    "Monday CRM",
    "Insightly",
  ],
  ERP: [
    "SAP S/4HANA",
    "Oracle NetSuite",
    "Microsoft Dynamics 365 Business Central",
    "Odoo",
    "Acumatica",
    "Infor CloudSuite",
    "Epicor",
    "SAP Business One",
  ],
  Finance: [
    "Xero",
    "QuickBooks Online",
    "NetSuite Financials",
    "Sage Intacct",
    "Microsoft Dynamics 365 Finance",
    "Oracle Fusion Cloud Financials",
    "FreshBooks",
    "Zoho Books",
  ],
  HRMS: [
    "Workday",
    "BambooHR",
    "SAP SuccessFactors",
    "ADP Workforce Now",
    "UKG Pro",
    "Rippling",
    "HiBob",
    "Gusto",
  ],
  ITSM: [
    "ServiceNow",
    "Jira Service Management",
    "Freshservice",
    "ManageEngine ServiceDesk Plus",
    "Zendesk",
    "BMC Helix",
    "TOPdesk",
    "Ivanti",
  ],
  MAP: [
    "HubSpot Marketing Hub",
    "Marketo",
    "Pardot (Account Engagement)",
    "Mailchimp",
    "ActiveCampaign",
    "Klaviyo",
    "Braze",
    "Customer.io",
  ],
  WMS: [
    "Manhattan WMS",
    "Oracle WMS Cloud",
    "SAP EWM",
    "Blue Yonder WMS",
    "Infor WMS",
    "Cin7",
    "ShipHero",
    "NetSuite WMS",
  ],
} as const;

const systemCategories = Object.keys(connectedSystemsByCategory) as (keyof typeof connectedSystemsByCategory)[];
const platformToCategory = Object.fromEntries(
  systemCategories.flatMap((category) =>
    connectedSystemsByCategory[category].map((platform) => [platform, category])
  )
) as Record<string, keyof typeof connectedSystemsByCategory>;

const defaultFilters: FilterState = {
  query: "",
  workflow: "All",
  outcomeCategory: "All",
  governance: "All",
  complexity: "All",
  timeToValue: "All",
  systems: [],
  sort: "best",
};

export default function RoleCatalog() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

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

  const filtered = useMemo(() => {
    return allRoles
      .filter((r) => {
        if (filters.workflow !== "All" && r.workflow !== filters.workflow) return false;
        if (filters.outcomeCategory !== "All" && r.outcomeCategory !== filters.outcomeCategory) return false;
        if (filters.governance !== "All" && r.governance !== filters.governance) return false;
        if (filters.complexity !== "All" && r.complexity !== filters.complexity) return false;
        if (filters.timeToValue !== "All" && r.timeToValue !== filters.timeToValue) return false;
        if (filters.systems.length > 0) {
          const selectedCategories = Array.from(
            new Set(filters.systems.map((platform) => platformToCategory[platform]).filter(Boolean))
          );
          if (!selectedCategories.every((category) => r.systems.includes(category as never))) return false;
        }

        const q = filters.query.trim().toLowerCase();
        if (!q) return true;
        const haystack = [
          r.title,
          r.description,
          r.detailedDescription,
          ...r.tags,
          ...r.functions.map((f) => f.name),
          ...r.functions.flatMap((f) => f.skills),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => {
        if (filters.sort === "name") return a.title.localeCompare(b.title);
        if (filters.sort === "fastest") {
          const rank = { "<2 weeks": 1, "2-4 weeks": 2, "1-2 months": 3 } as Record<string, number>;
          return rank[a.timeToValue] - rank[b.timeToValue];
        }
        return 0;
      });
  }, [allRoles, filters]);

  const update = (patch: Partial<FilterState>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  const toggleConnectedSystem = (platform: string) => {
    setFilters((prev) => ({
      ...prev,
      systems: prev.systems.includes(platform)
        ? prev.systems.filter((s) => s !== platform)
        : [...prev.systems, platform],
    }));
  };

  const [connectedSystemSearch, setConnectedSystemSearch] = useState<Record<string, string>>({});
  const [openSystemCategory, setOpenSystemCategory] = useState<string | null>(null);

  const allWorkflows = ["All", ...workflows];
  const showConnectedSystems = false;

  return (
    <div className="mt-8">
      {/* Quick Workflow Filter */}
      <div className="bg-slate-50 rounded-xl border border-slate-100 p-5">
        <p className="text-sm font-medium text-slate-500 mb-3">Quick Workflow Filter</p>
        <div className="flex flex-wrap gap-2">
          {allWorkflows.map((wf) => (
            <button
              key={wf}
              onClick={() => update({ workflow: wf })}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filters.workflow === wf
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-400"
              }`}
            >
              {wf}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-slate-50 rounded-xl border border-slate-100 p-5 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search roles, functions, or skills"
            value={filters.query}
            onChange={(e) => update({ query: e.target.value })}
            className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
          />

          {/* Workflows dropdown */}
          <select
            value={filters.workflow}
            onChange={(e) => update({ workflow: e.target.value })}
            className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 outline-none focus:border-blue-500 text-sm cursor-pointer"
          >
            <option value="All">All Workflows</option>
            {workflows.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>

          {/* Outcomes dropdown */}
          <select
            value={filters.outcomeCategory}
            onChange={(e) => update({ outcomeCategory: e.target.value })}
            className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 outline-none focus:border-blue-500 text-sm cursor-pointer"
          >
            <option value="All">All Outcomes</option>
            {outcomeCategoryOptions.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>

          {/* Governance dropdown */}
          <select
            value={filters.governance}
            onChange={(e) => update({ governance: e.target.value })}
            className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 outline-none focus:border-blue-500 text-sm cursor-pointer"
          >
            <option value="All">All Governance</option>
            {governanceOptions.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          {/* Complexity dropdown */}
          <select
            value={filters.complexity}
            onChange={(e) => update({ complexity: e.target.value })}
            className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 outline-none focus:border-blue-500 text-sm cursor-pointer"
          >
            <option value="All">All Complexity</option>
            {complexityOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Time-to-Value dropdown */}
          <select
            value={filters.timeToValue}
            onChange={(e) => update({ timeToValue: e.target.value })}
            className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 outline-none focus:border-blue-500 text-sm cursor-pointer"
          >
            <option value="All">All Time-to-Value</option>
            {timeToValueOptions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Sort dropdown */}
          <select
            value={filters.sort}
            onChange={(e) => update({ sort: e.target.value })}
            className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 outline-none focus:border-blue-500 text-sm cursor-pointer"
          >
            <option value="best">Sort: Best Match</option>
            <option value="fastest">Sort: Fastest Time-to-Value</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>
      </div>

      {/* Connected Systems (multi-select) */}
      {showConnectedSystems ? (
      <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 md:p-5 mt-4">
        <div className="flex items-start justify-between gap-3 mb-1">
          <p className="text-sm font-medium text-slate-500">
            Connected Systems <span className="text-slate-400">(multi-select)</span>
          </p>
          {filters.systems.length > 0 ? (
            <button
              type="button"
              onClick={() => update({ systems: [] })}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all
            </button>
          ) : null}
        </div>
        <p className="text-xs text-slate-400 mb-3">Select the platforms in your stack. Only systems with API, MCP, or CLI integration routes are listed.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
          {systemCategories.map((category) => {
            const options = connectedSystemsByCategory[category];
            const query = (connectedSystemSearch[category] ?? "").toLowerCase();
            const filteredOptions = options.filter((platform) =>
              platform.toLowerCase().includes(query)
            );
            const selectedCount = options.filter((platform) => filters.systems.includes(platform)).length;

            const isOpen = openSystemCategory === category;

            return (
              <div key={category} className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenSystemCategory(isOpen ? null : category)}
                  className={`w-full px-3 py-2.5 md:py-2 text-sm font-medium flex items-center justify-between transition-colors ${
                    isOpen ? "bg-slate-50 text-slate-900" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{category}</span>
                  <span className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${selectedCount > 0 ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                      {selectedCount} platform{selectedCount === 1 ? "" : "s"}
                    </span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </span>
                </button>
                {isOpen ? (
                  <div className="border-t border-slate-100 p-2 md:p-2.5 space-y-2">
                    <input
                      type="text"
                      value={connectedSystemSearch[category] ?? ""}
                      onChange={(e) =>
                        setConnectedSystemSearch((prev) => ({ ...prev, [category]: e.target.value }))
                      }
                      placeholder={`Search ${category} platforms`}
                      className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none focus:border-blue-500"
                    />
                    <div className="max-h-44 md:max-h-40 overflow-auto space-y-1 pr-1">
                      {filteredOptions.map((platform) => (
                        <label key={platform} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer py-1">
                          <input
                            type="checkbox"
                            checked={filters.systems.includes(platform)}
                            onChange={() => toggleConnectedSystem(platform)}
                            className="h-4 w-4 rounded border-slate-300"
                          />
                          <span>{platform}</span>
                        </label>
                      ))}
                      {filteredOptions.length === 0 ? (
                        <p className="text-xs text-slate-400 py-1">No platforms found</p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      ) : null}

      {/* Results count */}
      <p className="text-sm text-blue-600 font-medium mt-6">
        {filtered.length} {filtered.length === 1 ? "role" : "roles"} found
      </p>

      {/* Role cards grid with interleaved CTA */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl font-semibold text-slate-900">No roles found</p>
          <p className="text-slate-500 mt-2">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filtered.map((role, index) => (
            <AnimateOnScroll key={role.id} animation="fade-up" delay={Math.min(index * 50, 300)}>
              <RoleCard role={role} expert={expertByRole[role.id]} />
            </AnimateOnScroll>
          ))}
          <CustomRoleCTA />
        </div>
      )}
    </div>
  );
}
