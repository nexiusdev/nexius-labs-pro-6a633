import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AccountSubscriptionsContent from "@/components/AccountSubscriptionsContent";

export const metadata: Metadata = {
  title: "My Subscriptions — Nexius Labs",
  description: "View your subscriptions, subscribed roles, and onboarding progress.",
};

export default function AccountSubscriptionsPage() {
  return (
    <>
      <Navigation />
      <section className="gradient-hero relative overflow-hidden pt-28 md:pt-36 pb-12">
        <div className="hero-circle hero-circle-1" />
        <div className="hero-circle hero-circle-2" />
        <div className="container-wide relative z-10">
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-blue-400">
            Account
          </p>
          <h1 className="mt-2 text-center text-3xl font-bold text-white md:text-4xl text-balance">
            My Subscriptions
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg leading-relaxed text-slate-300">
            Review your subscribed roles, billing status, and onboarding progress in one place.
          </p>
        </div>
      </section>
      <main className="min-h-screen bg-white pb-16">
        <div className="container-wide pt-10">
          <AccountSubscriptionsContent />
        </div>
      </main>
      <Footer />
    </>
  );
}
