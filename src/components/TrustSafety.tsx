"use client";

import AnimateOnScroll from "@/components/AnimateOnScroll";
import { ShieldCheck, FileSearch, BarChart3 } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Enterprise Security",
    description:
      "SOC 2 compliant infrastructure. Your data never leaves your environment. AES-256 encryption at rest, TLS 1.3 in transit.",
  },
  {
    icon: FileSearch,
    title: "Full Audit Trails",
    description:
      "Every action logged. Every decision traceable. Complete transparency with role-based access controls and compliance reporting.",
  },
  {
    icon: BarChart3,
    title: "Measurable ROI",
    description:
      "Real-time KPI dashboards. Track exactly what your digital colleagues deliver — from time saved to error reduction.",
  },
];

export default function TrustSafety() {
  return (
    <section className="gradient-dark-band section-padding">
      <div className="container-wide">
        <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase text-center">
          Trust &amp; Safety
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mt-2">
          Enterprise-Grade by Default
        </h2>
        <p className="text-lg text-slate-400 text-center mt-3 max-w-2xl mx-auto">
          Built for organizations that demand security, compliance, and full
          accountability.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <AnimateOnScroll
                key={feature.title}
                animation="fade-up"
                delay={index * 150}
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 h-full">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mt-4">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </AnimateOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
