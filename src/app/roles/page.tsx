import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import RoleCatalog from "@/components/RoleCatalog";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Role Catalog — Nexius Labs",
  description:
    "Browse 20+ pre-built AI digital colleague roles across Finance, CRM, ERP, and HRMS workflows. Each role comes with defined functions, skills, and measurable KPIs.",
};

export default function RolesPage() {
  return (
    <>
      <Navigation />

      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden pt-28 md:pt-36 pb-12">
        <div className="hero-circle hero-circle-1" />
        <div className="hero-circle hero-circle-2" />
        <div className="container-wide relative z-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-400 text-center">
            Role Catalog
          </p>
          <h1 className="text-3xl md:text-[clamp(28px,4vw,40px)] font-bold text-white text-center mt-2 text-balance">
            Find Your Digital Colleague
          </h1>
          <p className="text-lg text-slate-300 text-center mt-4 max-w-2xl mx-auto leading-relaxed">
            Browse by function, systems, and governance model. Start with one role and scale by workflow.
          </p>
        </div>
      </section>

      {/* Catalog */}
      <section className="bg-white pb-20">
        <div className="container-wide">
          <RoleCatalog />
        </div>
      </section>

      <CTA />
      <Footer />
    </>
  );
}
