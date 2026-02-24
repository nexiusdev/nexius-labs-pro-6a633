"use client";

import { Star } from "lucide-react";
import { useShortlist } from "@/context/ShortlistContext";

export default function ShortlistButton({ roleId }: { roleId: string }) {
  const { toggle, has } = useShortlist();
  const isShortlisted = has(roleId);

  return (
    <button
      onClick={() => toggle(roleId)}
      className={`w-full inline-flex items-center justify-center gap-2 border-2 px-5 py-3 rounded-lg font-semibold transition-colors text-sm uppercase tracking-wide ${
        isShortlisted
          ? "border-amber-500 bg-amber-50 text-amber-700 hover:bg-amber-100"
          : "border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-800"
      }`}
    >
      <Star className={`w-4 h-4 ${isShortlisted ? "fill-amber-500" : ""}`} />
      {isShortlisted ? "Shortlisted" : "Add Shortlist"}
    </button>
  );
}
