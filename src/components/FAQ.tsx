"use client";

import AnimateOnScroll from "@/components/AnimateOnScroll";
import { Plus } from "lucide-react";

const faqItems = [
  {
    question: "How fast can we start?",
    answer:
      "Most deployments go live within 2-4 weeks. We start with your highest-impact bottleneck, deploy a single role, and iterate from there.",
  },
  {
    question: "What systems do you integrate with?",
    answer:
      "We work with major CRM (HubSpot, Salesforce), ERP (SAP, NetSuite), accounting (Xero, QuickBooks), and HRMS (BambooHR, Workday) platforms \u2014 or your custom stack via API.",
  },
  {
    question: "Is our data safe?",
    answer:
      "Enterprise-grade encryption at rest and in transit, role-based access controls, and complete audit trails on every action. We comply with SOC 2 and GDPR requirements.",
  },
  {
    question: "How are digital colleagues different from chatbots?",
    answer:
      "Digital colleagues are autonomous agents that own business outcomes and KPIs. They execute multi-step workflows, make decisions within defined guardrails, and escalate when human judgment is needed.",
  },
  {
    question: "What happens when something goes wrong?",
    answer:
      "Every critical action has human-in-the-loop approval gates. Anomalies trigger immediate alerts, and you always have full visibility through real-time dashboards and audit logs.",
  },
  {
    question: "Do we need to change our existing processes?",
    answer:
      "No. Digital colleagues adapt to your current workflows and systems. We map your existing processes and automate them as-is, with improvements suggested over time.",
  },
  {
    question: "How is pricing structured?",
    answer:
      "We offer role-based monthly pricing \u2014 you pay per digital colleague deployed. No long-term contracts required. Volume discounts available for multi-role deployments.",
  },
  {
    question: "Can we start with just one role?",
    answer:
      "Absolutely. Most clients start with a single high-impact role and expand once they see results. Our adoption path is designed for gradual scaling.",
  },
  {
    question: "What level of oversight do we maintain?",
    answer:
      "Full oversight. You set approval thresholds, review escalations, and can pause or adjust any role at any time. Think of it as a highly capable team member that always asks before making big decisions.",
  },
  {
    question: "What if we need a role you don\u2019t offer?",
    answer:
      "We build custom roles for specific workflows. Share your requirements and we\u2019ll scope a tailored digital colleague within your timeline.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="bg-slate-50 section-padding">
      <div className="container-wide">
        {/* Section Header */}
        <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase text-center">
          FAQ
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mt-2">
          Frequently asked questions
        </h2>
        <p className="text-lg text-slate-500 text-center mt-3">
          Everything you need to know about digital colleagues
        </p>

        {/* FAQ Items */}
        <div className="mt-12 max-w-3xl mx-auto space-y-3">
          {faqItems.map((item, index) => (
            <AnimateOnScroll
              key={index}
              animation="fade-up"
              delay={index * 100}
            >
              <div className="faq-item">
                <details className="group bg-white rounded-xl border border-slate-100 overflow-hidden">
                  <summary className="flex items-center justify-between p-5 cursor-pointer">
                    <span className="font-medium text-slate-900 text-left pr-4">
                      {item.question}
                    </span>
                    <Plus className="faq-icon w-5 h-5 text-slate-400 flex-shrink-0" />
                  </summary>
                  <div className="faq-answer">
                    <div className="faq-answer-inner">
                      <p className="px-5 pb-5 text-slate-600 text-sm leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </details>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
