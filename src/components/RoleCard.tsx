"use client";

import Link from "next/link";
import { Eye, Star, Mic } from "lucide-react";
import { workflowColors, type Role } from "@/data/roles";
import type { Expert } from "@/data/experts";
import { useShortlist } from "@/context/ShortlistContext";
import { formatSgd, getRolePricing } from "@/lib/pricing";

export default function RoleCard({ role, expert }: { role: Role; expert?: Expert }) {
  const colors = workflowColors[role.workflow];
  const { toggle, has } = useShortlist();
  const isShortlisted = has(role.id);
  const pricing = getRolePricing(role);

  return (
    <div
      className={`bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden card-hover border-l-4 ${colors.border} h-full flex flex-col`}
    >
      <div className="p-6 flex flex-col flex-1">
        {/* Avatar + header row */}
        <div className="flex items-start gap-3">
          <img
            src={role.image}
            alt={role.title}
            className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 shrink-0"
          />
          <div className="min-w-0">
            {/* Workflow badge */}
            <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
              {role.workflow}
            </span>
            {/* Title */}
            <Link href={`/roles/${role.id}`} className="group">
              <h3 className="text-lg font-semibold text-slate-900 mt-0.5 leading-snug group-hover:text-blue-600 transition-colors">
                {role.title}
              </h3>
            </Link>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          {role.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {role.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">From</p>
          <p className="text-sm font-semibold text-slate-900">{formatSgd(pricing.monthlySgd)}/month</p>
        </div>

        {/* Function count + Created by */}
        <div className="mt-auto pt-5 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">
            {role.functionCount} functions
          </span>
          {expert && (
            <Link
              href={`/experts/${expert.id}`}
              className="text-xs text-slate-400 hover:text-blue-600 transition-colors inline-flex items-center gap-1.5"
            >
              Created by
              <img
                src={expert.image}
                alt={expert.name}
                className="w-4 h-4 rounded-full object-cover"
              />
              <span className="font-medium text-slate-600 hover:text-blue-600">{expert.name}</span>
            </Link>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-3">
          <Link
            href={`/roles/${role.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            View Role
          </Link>
          <button
            onClick={() => toggle(role.id)}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 border-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              isShortlisted
                ? "border-amber-500 bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-800"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isShortlisted ? "fill-amber-500" : ""}`} />
            {isShortlisted ? "Shortlisted" : "Shortlist"}
          </button>
          <Link
            href={`/interview/${role.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 border-2 border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-800 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
          >
            <Mic className="w-3.5 h-3.5" />
            Interview
          </Link>
        </div>
      </div>
    </div>
  );
}
