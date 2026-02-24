"use client";

import AnimateOnScroll from "@/components/AnimateOnScroll";
import { Quote } from "lucide-react";

const logos = [
  { name: "HubSpot", color: "#FF7A59" },
  { name: "Salesforce", color: "#00A1E0" },
  { name: "SAP", color: "#0FAAFF" },
  { name: "NetSuite", color: "#1A3C5E" },
  { name: "Xero", color: "#13B5EA" },
  { name: "QuickBooks", color: "#2CA01C" },
  { name: "BambooHR", color: "#73C41D" },
  { name: "Workday", color: "#F68D2E" },
];

const testimonials = [
  {
    quote:
      "The AR/AP agent reduced our invoice processing time by 80%. What used to take our team 3 days now happens automatically.",
    name: "Sarah Chen",
    role: "CFO",
    company: "TechVentures Pte Ltd",
    initials: "SC",
  },
  {
    quote:
      "We deployed the CRM agents in 2 weeks. Lead response time went from hours to under 5 minutes.",
    name: "Marcus Tan",
    role: "Head of Sales",
    company: "GrowthPath Asia",
    initials: "MT",
  },
  {
    quote:
      "The hiring agent screens 500+ applications weekly. Our HR team now focuses on culture fit, not resume sorting.",
    name: "Priya Sharma",
    role: "CHRO",
    company: "ScaleUp Global",
    initials: "PS",
  },
];

export default function SocialProof() {
  const logoSet = logos.map((logo, i) => (
    <div key={i} className="flex items-center gap-2 px-8">
      <span
        className="inline-block w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: logo.color }}
        aria-hidden="true"
      />
      <span className="text-slate-400 font-medium text-lg whitespace-nowrap">
        {logo.name}
      </span>
    </div>
  ));

  return (
    <section className="bg-slate-50 section-padding">
      <div className="container-wide">
        {/* Part A: Logo Marquee */}
        <AnimateOnScroll animation="fade-up">
          <h2 className="text-center text-sm font-semibold text-slate-400 uppercase tracking-widest mb-8">
            Works with your existing tools
          </h2>
          <div className="overflow-hidden relative">
            {/* Left gradient mask */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
            {/* Right gradient mask */}
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />
            <div className="marquee-track">
              {/* First copy */}
              <div className="flex">{logoSet}</div>
              {/* Second copy for seamless loop */}
              <div className="flex">{logoSet}</div>
            </div>
          </div>
        </AnimateOnScroll>

        {/* Part B: Testimonials */}
        <div className="mt-16">
          <AnimateOnScroll animation="fade-up">
            <h2 className="text-center text-2xl font-bold text-slate-900 mb-2">
              Trusted by growing businesses
            </h2>
            <p className="text-center text-slate-500 mb-10">
              See what our clients say about their digital colleagues
            </p>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <AnimateOnScroll key={i} animation="fade-up" delay={i * 150}>
                <div className="bg-white rounded-xl border border-slate-100 p-6 card-hover shadow-sm">
                  <Quote className="w-8 h-8 text-blue-200" />
                  <p className="text-slate-600 mt-4 text-sm leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {t.initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {t.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {t.role}, {t.company}
                      </div>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
