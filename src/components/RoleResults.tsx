"use client";

import { useMemo } from "react";
import Image from "next/image";
import {
  departments,
  departmentColors,
  departmentBanners,
  filterRoles,
  type Role,
  type Department,
} from "@/data/roles";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import {
  Briefcase,
  Users,
  BarChart3,
  Building2,
  Settings,
  Activity,
  ArrowRight,
} from "lucide-react";

interface RoleResultsProps {
  searchQuery: string;
  department: string;
}

const departmentIcons: Record<Department, typeof Briefcase> = {
  CRM: Users,
  ERP: Building2,
  Finance: BarChart3,
  HRMS: Briefcase,
  Operations: Settings,
};

export default function RoleResults({
  searchQuery,
  department,
}: RoleResultsProps) {
  const filteredRoles = useMemo(
    () => filterRoles(searchQuery, department),
    [searchQuery, department]
  );

  const groupedByDepartment = useMemo(() => {
    const grouped: Partial<Record<Department, Role[]>> = {};
    for (const role of filteredRoles) {
      if (!grouped[role.department]) {
        grouped[role.department] = [];
      }
      grouped[role.department]!.push(role);
    }
    return grouped;
  }, [filteredRoles]);

  const activeDepartments = departments.filter(
    (dept) => groupedByDepartment[dept] && groupedByDepartment[dept]!.length > 0
  );

  return (
    <section id="roles" className="bg-slate-50 section-padding">
      <div className="container-wide">
        {filteredRoles.length === 0 ? (
          /* ── No Results ── */
          <AnimateOnScroll animation="fade-up">
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
                <Briefcase className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                No roles found matching your search
              </h3>
              <p className="text-slate-500 mt-2 max-w-md">
                Try adjusting your search terms or browse all departments to
                find the AI role you need.
              </p>
            </div>
          </AnimateOnScroll>
        ) : (
          /* ── Department Groups ── */
          <div className="space-y-12">
            {activeDepartments.map((dept) => {
              const deptRoles = groupedByDepartment[dept]!;
              const colors = departmentColors[dept];
              const bannerSrc = departmentBanners[dept];

              return (
                <div key={dept}>
                  {/* ── Category Banner ── */}
                  <AnimateOnScroll animation="fade-up">
                    <div className="relative overflow-hidden rounded-2xl h-48 md:h-56">
                      <Image
                        src={bannerSrc}
                        alt={`${dept} department banner`}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="(max-width: 1280px) 100vw, 1280px"
                      />
                      {/* Dark overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
                      {/* Content overlay */}
                      <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: colors.accent }}
                          />
                          <span className="text-sm font-medium text-white/80 uppercase tracking-wider">
                            Department
                          </span>
                        </div>
                        <h2 className="text-3xl font-bold text-white">
                          {dept}
                        </h2>
                        <p className="text-white/70 mt-1 text-base">
                          {deptRoles.length}{" "}
                          {deptRoles.length === 1 ? "role" : "roles"}
                        </p>
                      </div>
                    </div>
                  </AnimateOnScroll>

                  {/* ── Role Cards Grid ── */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    {deptRoles.map((role, index) => {
                      const RoleIcon = departmentIcons[role.department];

                      return (
                        <AnimateOnScroll
                          key={role.id}
                          animation="fade-up"
                          delay={index * 100}
                        >
                          <div className="role-card card-hover bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100">
                            {/* Color bar */}
                            <div className={`color-bar w-full ${colors.bg}`} />

                            {/* Card body */}
                            <div className="p-5">
                              {/* Role icon */}
                              <div
                                className={`role-icon w-10 h-10 rounded-lg flex items-center justify-center ${colors.light}`}
                              >
                                <RoleIcon
                                  className={`w-5 h-5 ${colors.text}`}
                                />
                              </div>

                              {/* Title */}
                              <h3 className="text-base font-semibold text-slate-900 mt-3">
                                {role.title}
                              </h3>

                              {/* Description */}
                              <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                                {role.description}
                              </p>

                              {/* Tags */}
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {role.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>

                              {/* KPI badge */}
                              <div className="mt-3 flex items-center gap-1.5">
                                <Activity
                                  className={`w-3.5 h-3.5 ${colors.text}`}
                                />
                                <span
                                  className={`text-xs font-medium ${colors.text}`}
                                >
                                  {role.kpi}
                                </span>
                              </div>

                              {/* Bottom row */}
                              <div className="flex justify-between items-center mt-4">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  <span className="text-xs text-emerald-600 font-medium">
                                    Available Now
                                  </span>
                                </div>
                                <a
                                  href="#contact"
                                  className={`text-xs font-medium ${colors.text} hover:underline`}
                                >
                                  Hire Role
                                </a>
                              </div>
                            </div>
                          </div>
                        </AnimateOnScroll>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Custom Roles CTA ── */}
        {filteredRoles.length > 0 && (
          <AnimateOnScroll animation="fade-up">
            <div className="mt-16 text-center bg-white rounded-2xl border border-slate-200 p-10 md:p-14">
              <h3 className="text-2xl font-bold text-slate-900">
                Don&apos;t see what you need?
              </h3>
              <p className="text-slate-500 mt-3 max-w-lg mx-auto text-base">
                We build custom roles for your specific workflows. Tell us the
                process you want to automate and we&apos;ll design an AI agent
                around it.
              </p>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-slate-900 text-white text-sm font-medium rounded-full hover:bg-slate-800 transition-colors"
              >
                Contact Us
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </AnimateOnScroll>
        )}
      </div>
    </section>
  );
}
