"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import HeroSearch from "@/components/HeroSearch";
import RoleResults from "@/components/RoleResults";
import ProfileShowcase from "@/components/ProfileShowcase";
import SocialProof from "@/components/SocialProof";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [workflow, setWorkflow] = useState("All");

  const handleSearch = (query: string, wf: string) => {
    setSearchQuery(query);
    setWorkflow(wf);
  };

  return (
    <>
      <Navigation />
      <HeroSearch onSearch={handleSearch} />
      <RoleResults searchQuery={searchQuery} department={workflow} />
      <ProfileShowcase />
      <SocialProof />
      <CTA />
      <Footer />
    </>
  );
}
