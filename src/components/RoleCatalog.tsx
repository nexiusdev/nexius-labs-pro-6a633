"use client";

import React, { useState, useMemo } from "react";
import {
  workflows,
  governanceOptions,
  complexityOptions,
  timeToValueOptions,
  outcomeCategoryOptions,
  systemOptions,
  advancedFilterRoles,
  type FilterState,
} from "@/data/roles";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import RoleCard from "@/components/RoleCard";

const CARDS_PER_CTA = 9;

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

  const filtered = useMemo(() => advancedFilterRoles(filters), [filters]);

  const update = (patch: Partial<FilterState>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  const toggleSystem = (sys: string) => {
    setFilters((prev) => ({
      ...prev,
      systems: prev.systems.includes(sys)
        ? prev.systems.filter((s) => s !== sys)
        : [...prev.systems, sys],
    }));
  };

  const allWorkflows = ["All", ...workflows];

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
            placeholder="Search role, function, skill"
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

      {/* Systems (multi-select) */}
      <div className="bg-slate-50 rounded-xl border border-slate-100 p-5 mt-4">
        <p className="text-sm font-medium text-slate-500 mb-3">
          Systems <span className="text-slate-400">(multi-select)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {systemOptions.map((sys) => (
            <button
              key={sys}
              onClick={() => toggleSystem(sys)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filters.systems.includes(sys)
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-400"
              }`}
            >
              {sys}
            </button>
          ))}
        </div>
      </div>

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
            <React.Fragment key={role.id}>
              <AnimateOnScroll animation="fade-up" delay={Math.min(index * 50, 300)}>
                <RoleCard role={role} />
              </AnimateOnScroll>
              {(index + 1) % CARDS_PER_CTA === 0 && index + 1 < filtered.length && (
                <CustomRoleCTA />
              )}
            </React.Fragment>
          ))}
          {/* Always show CTA at the end */}
          <CustomRoleCTA />
        </div>
      )}
    </div>
  );
}
