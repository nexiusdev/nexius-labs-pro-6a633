"use client";

import AnimateOnScroll from "@/components/AnimateOnScroll";
import { Search, Target, ShieldCheck } from "lucide-react";

const cards = [
  {
    icon: Search,
    title: "Search & Discover",
    description:
      "Find the exact AI-operated role for your business. Browse 16 roles across CRM, ERP, Finance, and HRMS.",
    delay: 0,
  },
  {
    icon: Target,
    title: "KPI-Driven Matching",
    description:
      "Every role is measured on real business outcomes. Track lead response time, DSO, processing accuracy, and more.",
    delay: 150,
  },
  {
    icon: ShieldCheck,
    title: "Trusted & Verified",
    description:
      "Human-in-the-loop oversight, complete audit trails, and approval gates on every critical action.",
    delay: 300,
  },
];

export default function ValueProps() {
  return (
    <section className="bg-white section-padding">
      <div className="container-wide">
        <span className="text-xs font-semibold tracking-widest text-blue-600 uppercase text-center block">
          WHY NEXIUS
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mt-2">
          Enterprise-grade AI execution for SMEs
        </h2>
        <p className="text-lg text-slate-500 text-center mt-3">
          Without the enterprise headcount
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {cards.map((card) => (
            <AnimateOnScroll key={card.title} delay={card.delay}>
              <div className="bg-slate-50 rounded-2xl p-8 text-center card-hover">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto">
                  <card.icon className="text-blue-600 size-7" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mt-5">
                  {card.title}
                </h3>
                <p className="text-slate-500 mt-3 text-sm leading-relaxed">
                  {card.description}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
