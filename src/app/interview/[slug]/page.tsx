import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { roles, getRoleById } from "@/data/roles";
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

  return (
    <>
      <Navigation />
      <main className="pt-24 pb-16 bg-white">
        <div className="container-wide">
          <InterviewChat role={role} />
        </div>
      </main>
      <Footer />
    </>
  );
}
