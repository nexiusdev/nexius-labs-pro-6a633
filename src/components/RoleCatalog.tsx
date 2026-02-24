"use client";

import { useState, useMemo } from "react";
import { Search, ArrowRight } from "lucide-react";
import { roles, departments, departmentColors, filterRoles, type Department } from "@/data/roles";
import AnimateOnScroll from "@/components/AnimateOnScroll";

export default function RoleCatalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDept, setActiveDept] = useState("All");

  const filtered = useMemo(
    () => filterRoles(searchQuery, activeDept),
    [searchQuery, activeDept]
  );

  const allDepts: (string)[] = ["All", ...departments];

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
          {filtered.map((role, index) => {
            const colors = departmentColors[role.department];
            return (
              <AnimateOnScroll key={role.id} animation="fade-up" delay={Math.min(index * 50, 300)}>
                <a
                  href={`/#contact`}
                  className="block group"
                >
                  <div className={`bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden card-hover border-l-4 ${colors.border} h-full flex flex-col`}>
                    <div className="p-6 flex flex-col flex-1">
                      {/* Department badge */}
                      <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
                        {role.department}
                      </span>

                      {/* Title */}
                      <h3 className="text-lg font-semibold text-slate-900 mt-2 leading-snug">
                        {role.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                        {role.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {role.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Bottom row */}
                      <div className="flex items-center justify-between mt-auto pt-5">
                        <span className="text-xs text-slate-400 font-medium">
                          {role.functionCount} functions
                        </span>
                        <span className={`text-sm font-medium ${colors.text} inline-flex items-center gap-1 group-hover:gap-2 transition-all`}>
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              </AnimateOnScroll>
            );
          })}
        </div>
      )}
    </div>
  );
}
