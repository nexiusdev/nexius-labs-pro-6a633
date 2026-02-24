"use client";

import CountUp from "@/components/CountUp";

export default function StatsCounter() {
  return (
    <section className="gradient-dark-band py-16">
      <div className="container-wide">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl md:text-5xl font-bold text-white">
              <CountUp end={16} suffix="+" />
            </p>
            <p className="text-sm text-slate-400 mt-2">Digital Roles</p>
          </div>

          <div>
            <p className="text-4xl md:text-5xl font-bold text-white">
              <CountUp end={4} />
            </p>
            <p className="text-sm text-slate-400 mt-2">Workflow Families</p>
          </div>

          <div>
            <p className="text-4xl md:text-5xl font-bold text-white">24/7</p>
            <p className="text-sm text-slate-400 mt-2">Continuity</p>
          </div>

          <div>
            <p className="text-4xl md:text-5xl font-bold text-white">
              &lt;4 Weeks
            </p>
            <p className="text-sm text-slate-400 mt-2">To Deploy</p>
          </div>
        </div>
      </div>
    </section>
  );
}
