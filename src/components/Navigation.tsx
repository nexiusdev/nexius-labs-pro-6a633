"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const sections = [
  { id: "roles", label: "Digital Roles" },
  { id: "how-it-works", label: "How It Works" },
  { id: "outcomes", label: "Why Nexius" },
];

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav
      className={`entrance-nav fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-slate-900/95 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container-wide flex items-center justify-between h-16">
        {/* Logo */}
        <a href="#" aria-label="Nexius Labs home" className="text-xl font-bold tracking-tight">
          <span className="text-white">nexius</span>
          <span className="text-blue-400">labs</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {sections.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={`nav-link text-sm font-medium ${
                activeSection === id
                  ? "active text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#contact"
            className="border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 rounded-full px-4 py-2 text-sm font-medium transition-colors"
          >
            Request Quote
          </a>
          <a
            href="#contact"
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-4 py-2 text-sm font-medium transition-colors"
          >
            Free Consultation
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden bg-slate-900/98 backdrop-blur-md absolute inset-x-0 top-16 bottom-0 min-h-[calc(100vh-4rem)]">
          <div className="container-wide py-8 flex flex-col gap-6">
            {sections.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setMobileOpen(false)}
                className="text-lg font-medium text-slate-200 hover:text-white transition-colors"
              >
                {label}
              </a>
            ))}
            <div className="flex flex-col gap-3 mt-4">
              <a
                href="#contact"
                onClick={() => setMobileOpen(false)}
                className="border border-slate-600 text-slate-300 hover:text-white text-center rounded-full px-4 py-3 text-sm font-medium transition-colors"
              >
                Request Quote
              </a>
              <a
                href="#contact"
                onClick={() => setMobileOpen(false)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-center rounded-full px-4 py-3 text-sm font-medium transition-colors"
              >
                Free Consultation
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
