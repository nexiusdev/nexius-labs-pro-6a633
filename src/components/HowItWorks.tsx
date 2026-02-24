"use client";

import AnimateOnScroll from "@/components/AnimateOnScroll";
import { UserCircle, Cog, Puzzle, TrendingUp } from "lucide-react";

const layers = [
  {
    icon: UserCircle,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    name: "Roles",
    subtitle: "Accountable digital leads",
    description:
      "Each Role owns a specific outcome or KPI \u2014 just like a human hire.",
    example: "AR Collections Agent owns Days Sales Outstanding (DSO)",
  },
  {
    icon: Cog,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    name: "Functions",
    subtitle: "Executable tasks under each role",
    description: "Functions are the specific jobs a Role performs daily.",
    example:
      "Match payments \u2192 Flag discrepancies \u2192 Send reminders",
  },
  {
    icon: Puzzle,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    name: "Skills",
    subtitle: "Reusable logic blocks",
    description: "Modular building blocks shared across Roles.",
    example: "Amount validation, Approval routing, PDF generation",
  },
  {
    icon: TrendingUp,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    name: "Adoption Path",
    subtitle: "From one role to full AI ops",
    description: "Scale at your own pace with a proven 4-step path.",
    example: null,
  },
];

const adoptionSteps = [
  {
    step: "STEP 1",
    number: "1",
    title: "Start with One Role",
    description:
      "Pick your highest-impact bottleneck and deploy a single digital colleague.",
  },
  {
    step: "STEP 2",
    number: "2",
    title: "Add Functions",
    description:
      "Expand the role\u2019s capabilities by enabling additional automated tasks.",
  },
  {
    step: "STEP 3",
    number: "3",
    title: "Bundle into Workflows",
    description:
      "Connect multiple roles into end-to-end business workflows.",
  },
  {
    step: "STEP 4",
    number: "4",
    title: "Scale to Full AI Ops",
    description: "Roll out across all departments with confidence.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white section-padding">
      <div className="container-wide">
        {/* Section Header */}
        <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase text-center">
          THE SYSTEM
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mt-2">
          Roles, Functions, Skills &mdash; A System That Scales
        </h2>
        <p className="text-lg text-slate-500 text-center mt-3">
          Every digital colleague follows a proven architecture
        </p>

        {/* Architecture Layers */}
        <div className="mt-12 space-y-6">
          {layers.map((layer, index) => {
            const Icon = layer.icon;
            return (
              <AnimateOnScroll
                key={layer.name}
                animation="fade-up"
                delay={index * 150}
              >
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Left: Icon + Label */}
                  <div className="md:w-48 flex-shrink-0">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${layer.iconBg}`}
                    >
                      <Icon className={`w-6 h-6 ${layer.iconColor}`} />
                    </div>
                    <p className="text-lg font-semibold mt-2">{layer.name}</p>
                  </div>

                  {/* Right: Content Card */}
                  <div className="flex-1 bg-slate-50 rounded-xl p-6">
                    <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                      {layer.subtitle}
                    </p>
                    <p className="text-slate-700 mt-2">{layer.description}</p>
                    {layer.example && (
                      <div className="bg-white rounded-lg p-4 mt-3 text-sm text-slate-600 border border-slate-100">
                        {layer.example}
                      </div>
                    )}
                  </div>
                </div>
              </AnimateOnScroll>
            );
          })}
        </div>

        {/* Adoption Path Steps */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-slate-900 text-center mb-8">
            Your Path to AI Operations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {adoptionSteps.map((item, index) => (
              <AnimateOnScroll
                key={item.number}
                animation="fade-up"
                delay={index * 150}
                className="adoption-card card-hover"
              >
                <div className="bg-white rounded-xl border border-slate-100 p-6 relative overflow-hidden">
                  <span className="absolute top-3 right-3 text-5xl font-bold text-slate-900 step-number">
                    {item.number}
                  </span>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                    {item.step}
                  </p>
                  <p className="text-lg font-semibold text-slate-900 mt-2">
                    {item.title}
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    {item.description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
