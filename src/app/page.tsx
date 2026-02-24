"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import HeroSearch from "@/components/HeroSearch";
import RoleResults from "@/components/RoleResults";
import ProfileShowcase from "@/components/ProfileShowcase";
import SocialProof from "@/components/SocialProof";
import ValueProps from "@/components/ValueProps";
import StatsCounter from "@/components/StatsCounter";
import HowItWorks from "@/components/HowItWorks";
import Integrations from "@/components/Integrations";
import Outcomes from "@/components/Outcomes";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [department, setDepartment] = useState("All");

  const handleSearch = (query: string, dept: string) => {
    setSearchQuery(query);
    setDepartment(dept);
  };

  return (
    <>
      <Navigation />
      <HeroSearch onSearch={handleSearch} />
      <RoleResults searchQuery={searchQuery} department={department} />
      <ProfileShowcase />
      <SocialProof />
      <ValueProps />
      <StatsCounter />
      <HowItWorks />
      <Integrations />
      <Outcomes />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
}
