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
      <main className="pt-24 pb-16 bg-slate-50 min-h-screen">
        <div className="container-wide">
          <ShortlistContent />
        </div>
      </main>
      <Footer />
    </>
  );
}
