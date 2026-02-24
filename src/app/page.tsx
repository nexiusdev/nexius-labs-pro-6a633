"use client";

import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import HeroSearch from "@/components/HeroSearch";
import ProfileShowcase from "@/components/ProfileShowcase";
import SocialProof from "@/components/SocialProof";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  const router = useRouter();

  const handleSearch = (query: string, wf: string) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (wf && wf !== "All") params.set("workflow", wf);
    router.push(`/roles${params.toString() ? "?" + params.toString() : ""}`);
  };

  return (
    <>
      <Navigation />
      <HeroSearch onSearch={handleSearch} />
      <ProfileShowcase />
      <SocialProof />
      <CTA />
      <Footer />
    </>
  );
}
