import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import HowItWorks from "@/components/HowItWorks";
import DeploymentSteps from "@/components/DeploymentSteps";
import ScalePath from "@/components/ScalePath";
import TrustSafety from "@/components/TrustSafety";
import Integrations from "@/components/Integrations";
import StatsCounter from "@/components/StatsCounter";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "How It Works — Nexius Labs",
  description:
    "Discover the Roles, Functions, and Skills architecture behind Nexius Labs digital colleagues. See how our system scales from one role to full AI operations.",
};

export default function HowItWorksPage() {
  return (
    <>
      <Navigation />
      <section className="gradient-hero relative overflow-hidden pt-28 md:pt-36 pb-12">
        <div className="hero-circle hero-circle-1" />
        <div className="hero-circle hero-circle-2" />
        <div className="container-wide relative z-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-400 text-center">
            The System
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center mt-2 text-balance">
            How It Works
          </h1>
          <p className="text-lg text-slate-300 text-center mt-4 max-w-2xl mx-auto leading-relaxed">
            Discover the Roles, Functions, and Skills architecture behind our
            digital colleagues.
          </p>
        </div>
      </section>
      <HowItWorks />
      <DeploymentSteps />
      <ScalePath />
      <TrustSafety />
      <Integrations />
      <StatsCounter />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
}
