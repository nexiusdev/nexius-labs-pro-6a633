import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import RoleCatalog from "@/components/RoleCatalog";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Role Catalog — Nexius Labs",
  description:
    "Browse 20+ pre-built AI digital colleague roles across Finance, CRM, ERP, HRMS, and Operations. Each role comes with defined functions, workflows, and measurable KPIs.",
};

export default function RolesPage() {
  return (
    <>
      <Navigation />

      {/* Hero */}
      <section className="pt-28 md:pt-36 pb-12 bg-white">
        <div className="container-wide">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 text-center">
            Role Catalog
          </p>
          <h1 className="text-3xl md:text-[clamp(28px,4vw,40px)] font-bold text-slate-900 text-center mt-2 text-balance">
            Find Your Perfect Digital Colleague
          </h1>
          <p className="text-lg text-slate-500 text-center mt-4 max-w-2xl mx-auto leading-relaxed">
            Browse 20+ pre-built roles across Finance, CRM, ERP, HR, and Operations.
            Each role comes with defined functions, workflows, and measurable KPIs.
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
