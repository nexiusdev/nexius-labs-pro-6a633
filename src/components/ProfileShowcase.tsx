"use client";

import AnimateOnScroll from "@/components/AnimateOnScroll";
import { CheckCircle2, ArrowRight } from "lucide-react";

const features = [
  {
    title: "Available 24/7",
    description: "Continuous processing without breaks or holidays",
  },
  {
    title: "Human-in-the-Loop",
    description: "Approval gates for high-value transactions",
  },
  {
    title: "Audit Trail",
    description: "Complete transaction history for compliance",
  },
  {
    title: "DSO Reduction",
    description: "Measurable improvement in days sales outstanding",
  },
];

const tags = ["accounts receivable", "accounts payable", "collections"];

export default function ProfileShowcase() {
  return (
    <section className="bg-white section-padding">
      <div className="container-wide">
        <div className="lg:grid lg:grid-cols-2 gap-12 items-center">
          {/* ── Left Column ── */}
          <AnimateOnScroll animation="slide-left">
            <span className="text-xs font-semibold tracking-widest text-blue-600 uppercase">
              FEATURED ROLE
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">
              AR/AP Agent
            </h2>
            <p className="text-lg text-slate-500 mt-3">
              Manages accounts receivable and payable end-to-end
            </p>

            <ul className="mt-6 space-y-4">
              {features.map((feature) => (
                <li key={feature.title} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-900">{feature.title}</p>
                    <p className="text-slate-500 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <a
              href="#contact"
              className="mt-8 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-medium inline-flex items-center gap-2 transition-colors"
            >
              Hire This Role
              <ArrowRight className="w-4 h-4" />
            </a>
          </AnimateOnScroll>

          {/* ── Right Column ── */}
          <AnimateOnScroll animation="slide-right">
            <div className="relative min-h-[400px] mt-10 lg:mt-0">
              {/* Background decorative element */}
              <div className="absolute w-full h-full bg-blue-100/50 rounded-3xl -rotate-3" aria-hidden="true" />

              {/* Main card */}
              <div className="relative bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">
                    AR/AP Agent
                  </h3>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Verified Role
                  </span>
                </div>

                {/* Status badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                    Available 24/7
                  </span>
                  <span className="text-xs font-medium text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                    Human-in-the-Loop Oversight
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* KPI section */}
                <div className="mt-6 bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">
                      DSO Reduction
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      35%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                      style={{ width: "65%" }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Average improvement across deployed clients
                  </p>
                </div>

                {/* Bottom row */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm text-emerald-600 font-medium">
                      Ready to Deploy
                    </span>
                  </div>
                  <a
                    href="#contact"
                    className="text-sm font-medium text-slate-600 border border-slate-200 hover:border-slate-400 hover:text-slate-800 px-4 py-2 rounded-full transition-colors"
                  >
                    Hire Role
                  </a>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
