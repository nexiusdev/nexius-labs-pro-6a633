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
      <div className="pt-16" />
      <ValueProps />
      <Outcomes />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
}
