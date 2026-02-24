"use client";

import AnimateOnScroll from "@/components/AnimateOnScroll";
import { Search, Settings, Zap, Users } from "lucide-react";

const steps = [
  {
    icon: Search,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    number: "01",
    title: "Choose a Role",
    description:
      "Browse our catalog of pre-built digital colleague roles across Finance, CRM, ERP, HR, and Operations.",
  },
  {
    icon: Settings,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    number: "02",
    title: "Define Functions",
    description:
      "Select the specific functions and skills each role should perform. Customize workflows to match your processes.",
  },
  {
    icon: Zap,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    number: "03",
    title: "Activate Workflows",
    description:
      "Connect to your existing systems and activate automated workflows. Your digital colleague starts working immediately.",
  },
  {
    icon: Users,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    number: "04",
    title: "Scale Your Team",
    description:
      "Add more roles, expand functions, and build a complete AI-powered operations team as your business grows.",
  },
];

export default function DeploymentSteps() {
  return (
    <section className="bg-slate-50 section-padding">
      <div className="container-wide">
        <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase text-center">
          Deployment
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mt-2">
          Step-by-Step Deployment
        </h2>
        <p className="text-lg text-slate-500 text-center mt-3 max-w-2xl mx-auto">
          From initial consultation to full deployment — here&rsquo;s exactly
          what happens.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <AnimateOnScroll
                key={step.number}
                animation="fade-up"
                delay={index * 150}
              >
                <div className="bg-white rounded-xl border border-slate-100 p-6 h-full flex flex-col card-hover shadow-sm">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${step.iconBg}`}
                    >
                      <Icon className={`w-6 h-6 ${step.iconColor}`} />
                    </div>
                    <span className="text-3xl font-bold text-slate-100">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-4">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed flex-1">
                    {step.description}
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
