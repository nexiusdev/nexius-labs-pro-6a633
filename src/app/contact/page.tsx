import type { Metadata } from "next";
import { Mail, MapPin, Clock, CheckCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contact — Nexius Labs",
  description:
    "Tell us about your operations challenges and we'll show you how digital colleagues can help. Book a free consultation.",
};

const infoCards = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@nexiuslabs.com",
    href: "mailto:hello@nexiuslabs.com",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Singapore",
    href: null,
  },
  {
    icon: Clock,
    label: "Response Time",
    value: "Within 24 hours",
    href: null,
  },
];

const quickStartBenefits = [
  "Live dashboard walkthrough",
  "Role recommendations for your business",
  "Pricing & deployment timeline",
];

export default function ContactPage() {
  return (
    <>
      <Navigation />

      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden pt-28 md:pt-36 pb-12">
        <div className="hero-circle hero-circle-1" />
        <div className="hero-circle hero-circle-2" />
        <div className="container-wide relative z-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-400 text-center">
            Get in Touch
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center mt-2 text-balance">
            Let&rsquo;s Build Your AI Team
          </h1>
          <p className="text-lg text-slate-300 text-center mt-4 max-w-2xl mx-auto leading-relaxed">
            Tell us about your operations challenges and we&rsquo;ll show you
            how digital colleagues can help.
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="pb-16 bg-white">
        <div className="container-wide pt-10">
          <div className="lg:grid lg:grid-cols-3 lg:gap-10">
            {/* Left column — Form (2/3) */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-slate-100 p-6 md:p-8 shadow-sm">
                <ContactForm />
              </div>
            </div>

            {/* Right column — Info cards (1/3) */}
            <div className="mt-8 lg:mt-0 space-y-4">
              {infoCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.label}
                    className="bg-slate-50 rounded-xl border border-slate-100 p-5 flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {card.label}
                      </p>
                      {card.href ? (
                        <a
                          href={card.href}
                          className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors mt-0.5 block"
                        >
                          {card.value}
                        </a>
                      ) : (
                        <p className="text-sm font-semibold text-slate-900 mt-0.5">
                          {card.value}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Quick Start card */}
              <div className="gradient-dark-band rounded-xl p-6">
                <h3 className="text-lg font-bold text-white">Quick Start</h3>
                <p className="text-sm text-slate-300 mt-2">
                  Want to see digital colleagues in action? Book a 15-minute
                  demo.
                </p>
                <ul className="mt-4 space-y-2">
                  {quickStartBenefits.map((benefit) => (
                    <li
                      key={benefit}
                      className="flex items-center gap-2 text-sm text-slate-300"
                    >
                      <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
