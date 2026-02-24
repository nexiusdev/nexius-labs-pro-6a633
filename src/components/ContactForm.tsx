"use client";

import { useState, FormEvent } from "react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData as unknown as Record<string, string>).toString(),
    })
      .then(() => setSubmitted(true))
      .catch(() => setSubmitted(true));
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Thank you!</h3>
        <p className="text-sm text-slate-500 mt-1">
          We&apos;ll be in touch within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form
      name="contact"
      method="POST"
      data-netlify="true"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="form-name" value="contact" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="Your name"
            className="block w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-1.5">
            Company
          </label>
          <input
            type="text"
            id="company"
            name="company"
            placeholder="Your company name"
            className="block w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="you@company.com"
            className="block w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="+65 1234 5678"
            className="block w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label htmlFor="company-size" className="block text-sm font-medium text-slate-700 mb-1.5">
            Company Size
          </label>
          <select
            id="company-size"
            name="company-size"
            className="block w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors cursor-pointer"
          >
            <option value="">Select size</option>
            <option value="1-10">1–10</option>
            <option value="11-50">11–50</option>
            <option value="51-200">51–200</option>
            <option value="201-500">201–500</option>
            <option value="500+">500+</option>
          </select>
        </div>

        <div>
          <label htmlFor="interest" className="block text-sm font-medium text-slate-700 mb-1.5">
            Area of Interest
          </label>
          <select
            id="interest"
            name="interest"
            className="block w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors cursor-pointer"
          >
            <option value="General Inquiry">General Inquiry</option>
            <option value="ERP Automation">ERP Automation</option>
            <option value="CRM & Sales">CRM &amp; Sales</option>
            <option value="Finance & Accounting">Finance &amp; Accounting</option>
            <option value="HR & Payroll">HR &amp; Payroll</option>
            <option value="Supply Chain & Logistics">Supply Chain &amp; Logistics</option>
            <option value="Custom Solution">Custom Solution</option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1.5">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          placeholder="Tell us about your operations challenges..."
          className="block w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-medium transition-colors mt-4"
      >
        Send Message
      </button>
    </form>
  );
}
