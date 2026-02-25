"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import Image from "next/image";

interface HeroSearchProps {
  onSearch: (query: string, department: string) => void;
}

export default function HeroSearch({ onSearch }: HeroSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [workflow, setWorkflow] = useState("All");
  const [roleCount, setRoleCount] = useState<number>(20);

  useEffect(() => {
    fetch("/api/catalog/roles")
      .then((r) => r.json())
      .then((json) => {
        const count = Array.isArray(json?.roles) ? json.roles.length : 0;
        if (count > 0) setRoleCount(count);
      })
      .catch(() => {});
  }, []);

  const handleQueryChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value, workflow);
  };

  const handleWorkflowChange = (value: string) => {
    setWorkflow(value);
    onSearch(searchQuery, value);
  };

  return (
    <section className="gradient-hero relative overflow-hidden pt-32 pb-20">
      {/* Floating decorative circles */}
      <div className="hero-circle hero-circle-1" />
      <div className="hero-circle hero-circle-2" />
      <div className="hero-circle hero-circle-3" />

      <div className="container-wide relative z-10">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
          {/* Left column */}
          <div>
            <span className="entrance-badge inline-block bg-blue-600/20 text-blue-300 text-sm font-medium px-4 py-1.5 rounded-full">
              Digital Colleagues as a Service
            </span>

            <h1 className="entrance-heading text-4xl md:text-5xl font-bold text-white leading-tight mt-6 text-balance">
              Find the right Digital Colleague for your business
            </h1>

            <p className="entrance-subheading text-lg text-slate-300 mt-4 max-w-lg">
              Search for AI-operated roles that handle your CRM, ERP, Finance,
              and HRMS workflows
            </p>

            {/* Search bar */}
            <div className="entrance-search mt-8">
              <div className="flex flex-col sm:flex-row bg-white rounded-xl overflow-hidden shadow-2xl p-1.5 gap-1.5 sm:gap-0">
                <input
                  type="text"
                  placeholder="Search roles... e.g. invoice, hiring, procurement"
                  aria-label="Search digital roles"
                  value={searchQuery}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  className="flex-1 px-4 py-3 text-slate-900 placeholder-slate-400 outline-none text-base min-w-0"
                />
                <select
                  value={workflow}
                  aria-label="Filter by workflow"
                  onChange={(e) => handleWorkflowChange(e.target.value)}
                  className="bg-slate-50 border-l border-slate-200 px-4 py-3 text-slate-600 text-sm outline-none cursor-pointer"
                >
                  <option value="All">All Workflows</option>
                  <option value="Finance">Finance</option>
                  <option value="CRM">CRM</option>
                  <option value="ERP">ERP</option>
                  <option value="HRMS">HRMS</option>
                </select>
                <button
                  onClick={() => onSearch(searchQuery, workflow)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Search size={18} />
                  <span>Search</span>
                </button>
              </div>
              <p className="text-sm text-slate-400 mt-3">
                {roleCount} digital {roleCount === 1 ? "role" : "roles"} available
              </p>
            </div>
          </div>

          {/* Right column - photo collage */}
          <div className="entrance-photos hidden lg:block">
            <div className="relative h-[480px]">
              {/* Main image */}
              <div className="absolute top-0 right-0 w-[340px] h-[380px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/hero-crm.jpg"
                  alt="Team working with AI dashboards"
                  width={340}
                  height={380}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              {/* Bottom-left image */}
              <div className="absolute bottom-0 left-0 w-[240px] h-[200px] rounded-xl overflow-hidden shadow-xl">
                <Image
                  src="/images/hero-finance.jpg"
                  alt="Finance analytics dashboard"
                  width={240}
                  height={200}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              {/* Top-left small image */}
              <div className="absolute top-8 left-8 w-[180px] h-[160px] rounded-xl overflow-hidden shadow-xl">
                <Image
                  src="/images/hero-hrms.jpg"
                  alt="Team collaboration"
                  width={180}
                  height={160}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
