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
      <main className="pt-24 pb-16 bg-white">
        <div className="container-wide">
          <InterviewsContent />
        </div>
      </main>
      <Footer />
    </>
  );
}
