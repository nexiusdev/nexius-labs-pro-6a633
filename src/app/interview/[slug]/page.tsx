import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { roles, getRoleById, departmentColors } from "@/data/roles";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import InterviewChat from "@/components/InterviewChat";

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
    title: `Interview: ${role.title} — Nexius Labs`,
    description: `Run an interview with the ${role.title} digital colleague before shortlist or quote decisions.`,
  };
}

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const role = getRoleById(slug);
  if (!role) notFound();

  const colors = departmentColors[role.department];

  return (
    <>
      <Navigation />
      <section className="gradient-hero relative overflow-hidden pt-28 pb-10">
        <div className="hero-circle hero-circle-1" />
        <div className="hero-circle hero-circle-2" />
        <div className="container-wide relative z-10">
          <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
            <Link href="/roles" className="hover:text-white transition-colors font-medium">
              Roles
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/roles/${role.id}`} className="hover:text-white transition-colors font-medium">
              {role.title}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-300">Interview</span>
          </nav>
          <span
            className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${colors.text} ${colors.light}`}
          >
            {role.department}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mt-3">
            Interview: {role.title}
          </h1>
          <p className="text-slate-300 mt-2">
            Run an interview with this digital role before shortlist or quote decisions.
          </p>
        </div>
      </section>
      <main className="pb-16 bg-white">
        <div className="container-wide pt-10">
          <InterviewChat role={role} />
        </div>
      </main>
      <Footer />
    </>
  );
}
