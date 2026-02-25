"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, GraduationCap, Briefcase } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import type { Expert } from "@/data/experts";

const highlights = [
  {
    icon: Briefcase,
    stat: "120+ years",
    label: "Combined Industry Experience",
    description:
      "Our experts bring decades of hands-on experience from companies like Deloitte, PwC, Samsung, Toyota, Salesforce, and SAP.",
  },
  {
    icon: GraduationCap,
    stat: "30+",
    label: "Professional Certifications",
    description:
      "CPA, CFA, Six Sigma Black Belt, SAP Certified, Salesforce Architect — every skill is backed by verified credentials.",
  },
  {
    icon: BadgeCheck,
    stat: "Every Skill",
    label: "Domain-Expert Created",
    description:
      "No generic AI templates. Each skill is designed by a specialist who has done the work — so the automation mirrors real-world best practices.",
  },
];

export default function ExpertCrafted() {
  const [experts, setExperts] = useState<Expert[]>([]);

  useEffect(() => {
    fetch("/api/catalog/experts")
      .then((r) => r.json())
      .then((json) => setExperts(Array.isArray(json?.experts) ? json.experts : []))
      .catch(() => {});
  }, []);

  const featured = useMemo(() => experts.slice(0, 6), [experts]);

  return (
    <section className="bg-slate-50 section-padding">
      <div className="container-wide">
        <AnimateOnScroll animation="fade-up">
          <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase text-center">
            Expert-Created Skills
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mt-2">
            Built by Practitioners, Not Prompt Engineers
          </h2>
          <p className="text-lg text-slate-500 text-center mt-3 max-w-2xl mx-auto leading-relaxed">
            Every skill inside every role is designed by a domain expert with
            real-world experience in that exact workflow — so you get automation
            that actually understands how the work gets done.
          </p>
        </AnimateOnScroll>

        {/* Highlights grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <AnimateOnScroll
                key={item.label}
                animation="fade-up"
                delay={index * 150}
              >
                <div className="bg-white rounded-xl border border-slate-100 p-6 h-full">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mt-4">
                    {item.stat}
                  </p>
                  <p className="text-sm font-semibold text-blue-600 mt-1">
                    {item.label}
                  </p>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </AnimateOnScroll>
            );
          })}
        </div>

        {/* Expert avatars + CTA */}
        <AnimateOnScroll animation="fade-up" delay={200}>
          <div className="mt-12 bg-white rounded-2xl border border-slate-100 p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
            {/* Avatar stack */}
            <div className="flex items-center shrink-0">
              <div className="flex -space-x-3">
                {featured.map((expert) => (
                  <Link
                    key={expert.id}
                    href={`/experts/${expert.id}`}
                    className="relative group"
                  >
                    <img
                      src={expert.image}
                      alt={expert.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-110 transition-transform"
                    />
                  </Link>
                ))}
              </div>
              <span className="ml-3 text-sm font-semibold text-slate-900">
                {experts.length} experts
              </span>
            </div>

            {/* Text */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-bold text-slate-900">
                Meet the Experts Behind Your Digital Colleagues
              </h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                From ex-Deloitte finance consultants to former Toyota production
                engineers — each expert brings 10–15 years of domain experience.
                Every role page shows exactly who created it and their
                credentials.
              </p>
            </div>

            {/* CTA */}
            <Link
              href="/roles"
              className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-700 text-white text-sm font-medium rounded-full transition-colors shrink-0"
            >
              Browse Roles
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
