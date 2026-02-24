import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ShortlistContent from "@/components/ShortlistContent";

export const metadata: Metadata = {
  title: "Shortlist — Nexius Labs",
  description: "Your shortlisted digital colleague roles. Build your deployment batch.",
};

export default function ShortlistPage() {
  return (
    <>
      <Navigation />
      <section className="gradient-hero relative overflow-hidden pt-28 md:pt-36 pb-12">
        <div className="hero-circle hero-circle-1" />
        <div className="hero-circle hero-circle-2" />
        <div className="container-wide relative z-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-400 text-center">
            Your Selections
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center mt-2 text-balance">
            Digital Colleague Cart
          </h1>
          <p className="text-lg text-slate-300 text-center mt-4 max-w-2xl mx-auto leading-relaxed">
            Build your first deployment batch. Start lean, then expand functions and workflow bundles.
          </p>
        </div>
      </section>
      <main className="pb-16 bg-white min-h-screen">
        <div className="container-wide pt-10">
          <ShortlistContent />
        </div>
      </main>
      <Footer />
    </>
  );
}
