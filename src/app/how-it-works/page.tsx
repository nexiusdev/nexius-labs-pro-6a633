import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import HowItWorks from "@/components/HowItWorks";
import Integrations from "@/components/Integrations";
import StatsCounter from "@/components/StatsCounter";
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
      <div className="pt-16" />
      <HowItWorks />
      <Integrations />
      <StatsCounter />
      <CTA />
      <Footer />
    </>
  );
}
