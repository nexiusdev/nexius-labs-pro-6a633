"use client";

import { useMemo } from "react";
import Image from "next/image";
import {
  workflows,
  workflowColors,
  workflowBanners,
  filterRoles,
  type Role,
  type Workflow,
} from "@/data/roles";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import RoleCard from "@/components/RoleCard";
import Link from "next/link";
import { Briefcase, ArrowRight } from "lucide-react";

const MAX_PER_DEPT = 3;

interface RoleResultsProps {
  searchQuery: string;
  department: string;
}

export default function RoleResults({
  searchQuery,
  department,
}: RoleResultsProps) {
  const filteredRoles = useMemo(
    () => filterRoles(searchQuery, department),
    [searchQuery, department]
  );

  const groupedByWorkflow = useMemo(() => {
    const grouped: Partial<Record<Workflow, Role[]>> = {};
    for (const role of filteredRoles) {
      if (!grouped[role.workflow]) {
        grouped[role.workflow] = [];
      }
      grouped[role.workflow]!.push(role);
    }
    return grouped;
  }, [filteredRoles]);

  const activeWorkflows = workflows.filter(
    (wf) => groupedByWorkflow[wf] && groupedByWorkflow[wf]!.length > 0
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
                Try adjusting your search terms or browse all workflows to
                find the AI role you need.
              </p>
            </div>
          </AnimateOnScroll>
        ) : (
          /* ── Workflow Groups ── */
          <div className="space-y-12">
            {activeWorkflows.map((wf) => {
              const wfRoles = groupedByWorkflow[wf]!;
              const colors = workflowColors[wf];
              const bannerSrc = workflowBanners[wf];

              const featured = wfRoles.slice(0, MAX_PER_DEPT);
              const hasMore = wfRoles.length > MAX_PER_DEPT;

              return (
                <div key={wf}>
                  {/* ── Category Banner ── */}
                  <AnimateOnScroll animation="fade-up">
                    <div className="relative overflow-hidden rounded-2xl h-48 md:h-56">
                      <Image
                        src={bannerSrc}
                        alt={`${wf} workflow banner`}
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
                            Workflow
                          </span>
                        </div>
                        <h2 className="text-3xl font-bold text-white">
                          {wf}
                        </h2>
                        <p className="text-white/70 mt-1 text-base">
                          {wfRoles.length}{" "}
                          {wfRoles.length === 1 ? "role" : "roles"}
                        </p>
                      </div>
                    </div>
                  </AnimateOnScroll>

                  {/* ── Role Cards Grid ── */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {featured.map((role, index) => (
                      <AnimateOnScroll
                        key={role.id}
                        animation="fade-up"
                        delay={index * 100}
                      >
                        <RoleCard role={role} />
                      </AnimateOnScroll>
                    ))}
                  </div>

                  {/* View all link */}
                  {hasMore && (
                    <div className="text-center mt-6">
                      <Link
                        href={`/roles?workflow=${encodeURIComponent(wf)}`}
                        className={`inline-flex items-center gap-2 text-sm font-medium ${colors.text} hover:underline`}
                      >
                        View all {wfRoles.length} {wf} roles
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
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
