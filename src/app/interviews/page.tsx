import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import InterviewsContent from "@/components/InterviewsContent";

export const metadata: Metadata = {
  title: "Interview History — Nexius Labs",
  description:
    "Track your interview sessions with digital colleagues. Review past conversations and continue where you left off.",
};

export default function InterviewsPage() {
  return (
    <>
      <Navigation />
      <section className="gradient-hero relative overflow-hidden pt-28 md:pt-36 pb-12">
        <div className="hero-circle hero-circle-1" />
        <div className="hero-circle hero-circle-2" />
        <div className="container-wide relative z-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-400 text-center">
            Interview Tracker
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center mt-2 text-balance">
            Interview History
          </h1>
          <p className="text-lg text-slate-300 text-center mt-4 max-w-2xl mx-auto leading-relaxed">
            Track your interview sessions with digital colleagues. Review past conversations and continue where you left off.
          </p>
        </div>
      </section>
      <main className="pb-16 bg-white">
        <div className="container-wide pt-10">
          <InterviewsContent />
        </div>
      </main>
      <Footer />
    </>
  );
}
