"use client";

import AnimateOnScroll from "@/components/AnimateOnScroll";
import ContactForm from "@/components/ContactForm";
import { CheckCircle } from "lucide-react";

export default function CTA() {
  return (
    <section id="contact" className="bg-white section-padding">
      <div className="container-wide">
        <AnimateOnScroll animation="fade-up">
          <div className="bg-slate-900 rounded-3xl p-8 md:p-12 overflow-hidden relative">
            {/* Decorative gradient circle */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-10" />

            <div className="relative lg:grid lg:grid-cols-2 gap-12 items-start">
              {/* Left column */}
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  Ready to Hire Your First Digital Colleague?
                </h2>
                <p className="text-lg text-slate-300 mt-4">
                  Start with one role. See measurable results in weeks, not months.
                </p>

                <ul className="mt-6 space-y-3">
                  <li className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    No long-term contracts
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    Results in weeks
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    Start with one role
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    Human-in-the-loop oversight
                  </li>
                </ul>

                <p className="text-sm text-slate-400 mt-8">
                  Or email us at{" "}
                  <a
                    href="mailto:hello@nexiuslabs.com"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    hello@nexiuslabs.com
                  </a>
                </p>
              </div>

              {/* Right column */}
              <div className="bg-white rounded-2xl p-6 shadow-xl mt-8 lg:mt-0">
                <ContactForm />
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
