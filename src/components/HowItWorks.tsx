"use client";

import AnimateOnScroll from "@/components/AnimateOnScroll";
import { UserCircle, Cog, Puzzle } from "lucide-react";

const tiers = [
  {
    icon: UserCircle,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    name: "Roles",
    description:
      "The job title — like Accounts Payable Specialist or Sales Operations Coordinator.",
    example: "AP Specialist, Payroll Admin, Sales Ops",
  },
  {
    icon: Cog,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    name: "Functions",
    description:
      "The major responsibilities within each role — like Invoice Processing or Pipeline Management.",
    example: "Invoice Processing, Lead Scoring, Payroll Calc",
  },
  {
    icon: Puzzle,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    name: "Skills",
    description:
      "The specific capabilities that power each function — like OCR extraction or deduplication.",
    example: "OCR, Matching, Validation, Enrichment",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white section-padding">
      <div className="container-wide">
        <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase text-center">
          Operating Model
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mt-2">
          Roles, Functions, Skills
        </h2>
        <p className="text-lg text-slate-500 text-center mt-3 max-w-2xl mx-auto">
          Our three-tier model makes it easy to understand exactly what each
          digital colleague does and how they deliver value.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {tiers.map((tier, index) => {
            const Icon = tier.icon;
            return (
              <AnimateOnScroll
                key={tier.name}
                animation="fade-up"
                delay={index * 150}
              >
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-6 h-full flex flex-col">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${tier.iconBg}`}
                  >
                    <Icon className={`w-6 h-6 ${tier.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-4">
                    {tier.name}
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed flex-1">
                    {tier.description}
                  </p>
                  <div className="bg-white rounded-lg border border-slate-100 px-4 py-3 mt-4">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
                      Examples
                    </p>
                    <p className="text-sm text-slate-700 font-medium">
                      {tier.example}
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
