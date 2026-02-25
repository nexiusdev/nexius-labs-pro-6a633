import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Briefcase, GraduationCap, Award, ArrowRight, ChevronRight } from "lucide-react";
import { workflowColors } from "@/data/roles";
import { getAllExpertsDb, getAllRolesDb, getExpertByIdDb } from "@/lib/catalog";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export async function generateStaticParams() {
  const experts = await getAllExpertsDb();
  return experts.map((expert) => ({ slug: expert.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const expert = await getExpertByIdDb(slug);
  if (!expert) return { title: "Expert Not Found" };
  return {
    title: `${expert.name} — ${expert.title} | Nexius Labs`,
    description: expert.headline,
  };
}

export default async function ExpertProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const expert = await getExpertByIdDb(slug);
  if (!expert) notFound();

  const allRoles = await getAllRolesDb();
  const createdRoles = allRoles.filter((r) => expert.roleIds.includes(r.id));

  return (
    <>
      <Navigation />

      {/* Profile hero */}
      <section className="gradient-hero relative overflow-hidden pt-28 pb-10">
        <div className="hero-circle hero-circle-1" />
        <div className="hero-circle hero-circle-2" />
        <div className="container-wide relative z-10">
          <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
            <Link href="/roles" className="hover:text-white transition-colors font-medium">
              Roles
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-300">{expert.name}</span>
          </nav>
          <div className="flex flex-col md:flex-row items-start gap-6">
            <img
              src={expert.image}
              alt={expert.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-white/20 shadow-lg shrink-0"
            />
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white">{expert.name}</h1>
              <p className="text-lg text-blue-300 font-medium mt-1">{expert.title}</p>
              <div className="flex items-center gap-2 text-slate-300 mt-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{expert.location}</span>
              </div>
              <p className="text-slate-300 mt-4 leading-relaxed max-w-2xl">
                {expert.headline}
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="pb-16 bg-white">
        <div className="container-wide pt-10">
          {/* Two-column layout */}
          <div className="lg:grid lg:grid-cols-3 lg:gap-12">
            {/* Left column (2/3) */}
            <div className="lg:col-span-2 space-y-10">
              {/* About */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900">About</h2>
                <p className="text-slate-600 mt-4 leading-relaxed">{expert.about}</p>
              </section>

              {/* Experience */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-slate-400" />
                  Experience
                </h2>
                <div className="mt-6 space-y-6">
                  {expert.experience.map((exp) => (
                    <div key={exp.company + exp.period} className="border-l-2 border-blue-500 pl-5">
                      <h3 className="text-lg font-semibold text-slate-900">{exp.role}</h3>
                      <p className="text-sm text-blue-600 font-medium">{exp.company}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{exp.period}</p>
                      <p className="text-sm text-slate-600 mt-2 leading-relaxed">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Education */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-slate-400" />
                  Education
                </h2>
                <div className="mt-6 space-y-4">
                  {expert.education.map((edu) => (
                    <div key={edu.institution} className="border-l-2 border-slate-200 pl-5">
                      <h3 className="font-semibold text-slate-900">{edu.degree}</h3>
                      <p className="text-sm text-slate-500">{edu.institution} &middot; {edu.year}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Certifications */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-slate-400" />
                  Certifications
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {expert.certifications.map((cert) => (
                    <span
                      key={cert}
                      className="text-sm text-slate-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg font-medium"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </section>
            </div>

            {/* Right column (1/3) */}
            <div className="mt-10 lg:mt-0 space-y-6">
              {/* Expertise */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Areas of Expertise</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {expert.expertise.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-md font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Roles Created */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Roles Created</h3>
                <div className="mt-3 space-y-3">
                  {createdRoles.map((role) => {
                    if (!role) return null;
                    const colors = workflowColors[role.workflow];
                    return (
                      <Link
                        key={role.id}
                        href={`/roles/${role.id}`}
                        className="flex items-center justify-between bg-white border border-slate-100 rounded-lg p-3 hover:border-slate-300 transition-colors group"
                      >
                        <div className="min-w-0">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${colors.text}`}>
                            {role.workflow}
                          </span>
                          <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                            {role.title}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 ml-2" />
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* CTA */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Work with {expert.name.split(" ")[0]}</h3>
                <p className="text-sm text-slate-500 mt-2">
                  Get expert guidance on deploying digital colleagues designed by {expert.name.split(" ")[0]}.
                </p>
                <Link
                  href="/#contact"
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-lg font-semibold transition-colors text-sm uppercase tracking-wide"
                >
                  Book Free Consultation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
