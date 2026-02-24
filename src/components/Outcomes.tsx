"use client";

import AnimateOnScroll from "@/components/AnimateOnScroll";
import CountUp from "@/components/CountUp";

export default function Outcomes() {
  return (
    <section id="outcomes" className="bg-white section-padding">
      <div className="container-wide">
        <span className="text-xs font-semibold tracking-widest text-blue-600 uppercase text-center block">
          OUTCOMES
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mt-2">
          Measurable results, not promises
        </h2>
        <p className="text-lg text-slate-500 text-center mt-3">
          Our digital colleagues deliver quantifiable business impact
        </p>

        <div className="bento-grid mt-12">
          {/* Card 1 - Large: Faster Processing */}
          <div className="bento-large">
            <AnimateOnScroll animation="fade-up">
              <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white overflow-hidden">
                <p className="text-5xl font-bold">
                  <CountUp end={3} suffix="x" />
                </p>
                <h3 className="text-xl font-semibold mt-2">
                  Faster Processing
                </h3>
                <p className="text-blue-100 mt-2">
                  Automated workflows process transactions 3x faster than
                  manual operations
                </p>
                <div
                  className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full border-4 border-white/10"
                  aria-hidden="true"
                />
                <div
                  className="absolute -bottom-2 -right-2 w-20 h-20 rounded-full border-4 border-white/5"
                  aria-hidden="true"
                />
              </div>
            </AnimateOnScroll>
          </div>

          {/* Card 2 - Large: Cost Reduction */}
          <div className="bento-large">
            <AnimateOnScroll animation="fade-up" delay={150}>
              <div className="relative bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-8 text-white overflow-hidden">
                <p className="text-5xl font-bold">
                  <CountUp end={80} suffix="%" />
                </p>
                <h3 className="text-xl font-semibold mt-2">Cost Reduction</h3>
                <p className="text-emerald-100 mt-2">
                  Reduce operational costs compared to traditional hiring for
                  equivalent output
                </p>
              </div>
            </AnimateOnScroll>
          </div>

          {/* Card 3 - Small: Accuracy Rate */}
          <AnimateOnScroll animation="fade-up" delay={100}>
            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
              <p className="text-3xl font-bold text-slate-900">
                <CountUp end={99} suffix=".5%" />
              </p>
              <h3 className="text-sm font-semibold text-slate-700 mt-1">
                Accuracy Rate
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Across all automated reconciliation and payroll tasks
              </p>
            </div>
          </AnimateOnScroll>

          {/* Card 4 - Small: Response Time */}
          <AnimateOnScroll animation="fade-up" delay={150}>
            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
              <p className="text-3xl font-bold text-slate-900">&lt;5 min</p>
              <h3 className="text-sm font-semibold text-slate-700 mt-1">
                Response Time
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Average lead response time with CRM automation
              </p>
            </div>
          </AnimateOnScroll>

          {/* Card 5 - Small: Availability */}
          <AnimateOnScroll animation="fade-up" delay={200}>
            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
              <p className="text-3xl font-bold text-slate-900">24/7</p>
              <h3 className="text-sm font-semibold text-slate-700 mt-1">
                Availability
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Continuous operations without breaks or holidays
              </p>
            </div>
          </AnimateOnScroll>

          {/* Card 6 - Small: Time to Deploy */}
          <AnimateOnScroll animation="fade-up" delay={250}>
            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
              <p className="text-3xl font-bold text-slate-900">2-4 wks</p>
              <h3 className="text-sm font-semibold text-slate-700 mt-1">
                Time to Deploy
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                From kickoff to live production deployment
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
