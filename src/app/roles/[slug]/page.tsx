import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ChevronRight, Mic, MessageCircle, FileText } from "lucide-react";
import { roles, getRoleById, getRelatedRoles, departmentColors } from "@/data/roles";
import Navigation from "@/components/Navigation";
import RoleCard from "@/components/RoleCard";
import ShortlistButton from "@/components/ShortlistButton";
import Footer from "@/components/Footer";

export function generateStaticParams() {
  return roles.map((role) => ({ slug: role.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const role = getRoleById(slug);
  if (!role) return { title: "Role Not Found" };
  return {
    title: `${role.title} — Nexius Labs`,
    description: role.detailedDescription,
  };
}

export default async function RoleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const role = getRoleById(slug);
  if (!role) notFound();

  const colors = departmentColors[role.department];
  const related = getRelatedRoles(role);

  return (
    <>
      <Navigation />

      <main className="pt-20 pb-16 bg-white">
        <div className="container-wide">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-400 mb-8">
            <Link href="/roles" className="hover:text-slate-700 transition-colors font-medium">
              Roles
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-600">{role.title}</span>
          </nav>

          {/* Two-column layout */}
          <div className="lg:grid lg:grid-cols-3 lg:gap-12">
            {/* ── Left column (2/3) ── */}
            <div className="lg:col-span-2">
              {/* Header */}
              <span
                className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${colors.text} ${colors.light}`}
              >
                {role.department}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3">
                {role.title}
              </h1>
              <p className="text-lg text-slate-500 mt-4 leading-relaxed max-w-2xl">
                {role.detailedDescription}
              </p>

              {/* Functions & Skills */}
              <h2 className="text-2xl font-bold text-slate-900 mt-12">
                Functions &amp; Skills
              </h2>
              <div className="mt-6 space-y-4">
                {role.functions.map((fn) => (
                  <div
                    key={fn.name}
                    className="border border-slate-100 rounded-xl p-5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-900">{fn.name}</h4>
                      <span className="text-sm font-semibold" style={{ color: colors.accent }}>
                        {fn.automationPercent}% automated
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${fn.automationPercent}%`,
                          backgroundColor: colors.accent,
                        }}
                      />
                    </div>
                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {fn.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs text-slate-600 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Expected Outcomes */}
              <h2 className="text-2xl font-bold text-slate-900 mt-12">
                Expected Outcomes
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                {role.outcomes.map((outcome) => (
                  <div
                    key={outcome.label}
                    className="border border-slate-100 rounded-xl p-5"
                  >
                    <p className="text-2xl font-bold" style={{ color: colors.accent }}>
                      {outcome.value}
                    </p>
                    <p className="text-sm font-semibold text-slate-900 mt-1">
                      {outcome.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {outcome.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right column (sidebar, 1/3) ── */}
            <div className="mt-12 lg:mt-0 space-y-6">
              {/* Action buttons card */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <p className="text-sm text-slate-500 mb-4">
                  Time-to-value: 2–4 weeks
                </p>
                <div className="space-y-3">
                  <Link
                    href={`/interview/${role.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 border-2 border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white px-5 py-3 rounded-lg font-semibold transition-colors text-sm uppercase tracking-wide"
                  >
                    <Mic className="w-4 h-4" />
                    Interview This Role
                  </Link>
                  <ShortlistButton roleId={role.id} />
                  <Link
                    href="/#contact"
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white px-5 py-3 rounded-lg font-semibold transition-all text-sm uppercase tracking-wide shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Book Free Consultation
                  </Link>
                  <Link
                    href="/#contact"
                    className="w-full inline-flex items-center justify-center gap-2 border-2 border-slate-300 text-slate-600 hover:border-slate-800 hover:text-slate-800 px-5 py-3 rounded-lg font-semibold transition-colors text-sm uppercase tracking-wide"
                  >
                    <FileText className="w-4 h-4" />
                    Request Quote
                  </Link>
                </div>
              </div>

              {/* Hire CTA card */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">
                  Hire This Digital Colleague
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Deploy this role in your organization. Start automating in 48 hours.
                </p>
                <Link
                  href="/#contact"
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-lg font-medium transition-colors text-sm"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Workflows card */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Workflows</h3>
                <div className="mt-3 space-y-2">
                  {role.tags.map((tag) => (
                    <div
                      key={tag}
                      className="text-sm text-slate-600 bg-white border border-slate-100 px-3 py-2 rounded-lg"
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              </div>

              {/* Automation Level card */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  Automation Level
                </h3>
                <div className="mt-3 space-y-3">
                  {role.functions.map((fn) => (
                    <div key={fn.name} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{fn.name}</span>
                      <span className="text-sm font-bold text-slate-900">
                        {fn.automationPercent}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Related Roles */}
          {related.length > 0 && (
            <div className="mt-20 border-t border-slate-100 pt-12">
              <h2 className="text-2xl font-bold text-slate-900">
                Related Roles in {role.department}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {related.map((r) => (
                  <RoleCard key={r.id} role={r} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
