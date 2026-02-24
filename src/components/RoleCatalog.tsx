"use client";

import { useState, useMemo } from "react";
import {
  departments,
  governanceOptions,
  complexityOptions,
  timeToValueOptions,
  outcomeCategoryOptions,
  systemOptions,
  advancedFilterRoles,
  type FilterState,
} from "@/data/roles";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import RoleCard from "@/components/RoleCard";

const defaultFilters: FilterState = {
  query: "",
  department: "All",
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

  const allDepts = ["All", ...departments];

  return (
    <div className="mt-8">
      {/* Quick Family Filter */}
      <div className="bg-slate-50 rounded-xl border border-slate-100 p-5">
        <p className="text-sm font-medium text-slate-500 mb-3">Quick Family Filter</p>
        <div className="flex flex-wrap gap-2">
          {allDepts.map((dept) => (
            <button
              key={dept}
              onClick={() => update({ department: dept })}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filters.department === dept
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-400"
              }`}
            >
              {dept}
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

          {/* Families dropdown */}
          <select
            value={filters.department}
            onChange={(e) => update({ department: e.target.value })}
            className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 outline-none focus:border-blue-500 text-sm cursor-pointer"
          >
            <option value="All">All Families</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
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

      {/* Role cards grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl font-semibold text-slate-900">No roles found</p>
          <p className="text-slate-500 mt-2">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filtered.map((role, index) => (
            <AnimateOnScroll key={role.id} animation="fade-up" delay={Math.min(index * 50, 300)}>
              <RoleCard role={role} />
            </AnimateOnScroll>
          ))}
        </div>
      )}
    </div>
  );
}
