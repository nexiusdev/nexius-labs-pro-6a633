"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { departments, filterRoles } from "@/data/roles";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import RoleCard from "@/components/RoleCard";

export default function RoleCatalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDept, setActiveDept] = useState("All");

  const filtered = useMemo(
    () => filterRoles(searchQuery, activeDept),
    [searchQuery, activeDept]
  );

  const allDepts: string[] = ["All", ...departments];

  return (
    <div className="mt-12">
      {/* Search + Filter */}
      <div className="max-w-3xl">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          {allDepts.map((dept) => (
            <button
              key={dept}
              onClick={() => setActiveDept(dept)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeDept === dept
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-500 mt-6">
        {filtered.length} {filtered.length === 1 ? "role" : "roles"} found
      </p>

      {/* Role cards grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl font-semibold text-slate-900">No roles found</p>
          <p className="text-slate-500 mt-2">Try adjusting your search or filter.</p>
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
