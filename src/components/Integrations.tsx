"use client";

import AnimateOnScroll from "@/components/AnimateOnScroll";

interface Platform {
  name: string;
  color: string;
}

interface Category {
  label: string;
  platforms: Platform[];
}

const categories: Category[] = [
  {
    label: "CRM",
    platforms: [
      { name: "HubSpot", color: "#FF7A59" },
      { name: "Salesforce", color: "#00A1E0" },
      { name: "Zoho", color: "#DC2626" },
      { name: "Pipedrive", color: "#1B1B1B" },
    ],
  },
  {
    label: "ERP",
    platforms: [
      { name: "SAP", color: "#0070F2" },
      { name: "NetSuite", color: "#7F3F98" },
      { name: "Odoo", color: "#714B67" },
      { name: "Microsoft Dynamics", color: "#002050" },
    ],
  },
  {
    label: "Finance",
    platforms: [
      { name: "Xero", color: "#13B5EA" },
      { name: "QuickBooks", color: "#2CA01C" },
      { name: "Sage", color: "#00DC00" },
      { name: "FreshBooks", color: "#0075DD" },
    ],
  },
  {
    label: "HRMS",
    platforms: [
      { name: "BambooHR", color: "#73C41D" },
      { name: "Workday", color: "#005CB9" },
      { name: "Gusto", color: "#F45D48" },
      { name: "Personio", color: "#1D2939" },
    ],
  },
];

export default function Integrations() {
  return (
    <section className="bg-slate-50 section-padding">
      <div className="container-wide">
        <span className="text-xs font-semibold tracking-widest text-blue-600 uppercase text-center block">
          INTEGRATIONS
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mt-2">
          Connects to your existing stack
        </h2>
        <p className="text-lg text-slate-500 text-center mt-3">
          Seamless integration with the platforms you already use
        </p>

        <div className="mt-12">
          {categories.map((category, categoryIndex) => (
            <div key={category.label} className="mb-10">
              <AnimateOnScroll animation="fade-up" delay={categoryIndex * 100}>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  {category.label}
                </h3>
              </AnimateOnScroll>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {category.platforms.map((platform, platformIndex) => (
                  <AnimateOnScroll
                    key={platform.name}
                    animation="fade-up"
                    delay={categoryIndex * 100 + platformIndex * 75}
                  >
                    <div className="bg-white rounded-xl border border-slate-100 p-5 flex items-center gap-3 card-hover shadow-sm">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: platform.color }}
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {platform.name}
                      </span>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
