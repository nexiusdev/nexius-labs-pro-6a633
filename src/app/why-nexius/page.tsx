import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import ValueProps from "@/components/ValueProps";
import Outcomes from "@/components/Outcomes";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Why Nexius — Nexius Labs",
  description:
    "Enterprise-grade AI execution for SMEs. Measurable outcomes, trusted oversight, and answers to your questions about digital colleagues.",
};

export default function WhyNexiusPage() {
  return (
    <>
      <Navigation />
      <section className="gradient-hero relative overflow-hidden pt-28 md:pt-36 pb-12">
        <div className="hero-circle hero-circle-1" />
        <div className="hero-circle hero-circle-2" />
        <div className="container-wide relative z-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-400 text-center">
            Why Nexius
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center mt-2 text-balance">
            Enterprise-Grade AI Execution for SMEs
          </h1>
          <p className="text-lg text-slate-300 text-center mt-4 max-w-2xl mx-auto leading-relaxed">
            Measurable outcomes, trusted oversight, and transparent pricing — without the enterprise headcount.
          </p>
        </div>
      </section>
      <ValueProps />
      <Outcomes />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
}
