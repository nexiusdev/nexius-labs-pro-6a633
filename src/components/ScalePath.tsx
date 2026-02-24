"use client";

import AnimateOnScroll from "@/components/AnimateOnScroll";

const scaleSteps = [
  {
    number: "01",
    title: "Start with 1 Role",
    description:
      "Pick the role with the highest impact. Deploy it in 48 hours and measure results.",
  },
  {
    number: "02",
    title: "Add Functions",
    description:
      "Expand the role's capabilities by adding more functions and workflows as needs emerge.",
  },
  {
    number: "03",
    title: "Bundle Workflows",
    description:
      "Connect multiple roles into end-to-end workflows. Procurement feeds into AP feeds into reporting.",
  },
  {
    number: "04",
    title: "Scale the Team",
    description:
      "Add roles across workflows. Build a complete AI operations team that grows with your business.",
  },
];

export default function ScalePath() {
  return (
    <section className="bg-white section-padding">
      <div className="container-wide">
        <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase text-center">
          Growth Path
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mt-2">
          Grow at Your Own Pace
        </h2>
        <p className="text-lg text-slate-500 text-center mt-3 max-w-2xl mx-auto">
          Start small, prove value, then scale. No long-term commitments
          required.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {scaleSteps.map((step, index) => (
            <AnimateOnScroll
              key={step.number}
              animation="fade-up"
              delay={index * 150}
              className="adoption-card card-hover"
            >
              <div className="bg-slate-50 rounded-xl border border-slate-100 p-6 relative overflow-hidden h-full">
                <span className="absolute top-4 right-4 text-5xl font-bold text-slate-200 leading-none">
                  {step.number}
                </span>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  Step {step.number}
                </p>
                <h3 className="text-lg font-bold text-slate-900 mt-3">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed relative z-10">
                  {step.description}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
