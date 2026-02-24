import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { departmentColors, type Role } from "@/data/roles";

export default function RoleCard({ role }: { role: Role }) {
  const colors = departmentColors[role.department];

  return (
    <Link href={`/roles/${role.id}`} className="block group">
      <div
        className={`bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden card-hover border-l-4 ${colors.border} h-full flex flex-col`}
      >
        <div className="p-6 flex flex-col flex-1">
          {/* Department badge */}
          <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
            {role.department}
          </span>

          {/* Title */}
          <h3 className="text-lg font-semibold text-slate-900 mt-2 leading-snug">
            {role.title}
          </h3>

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

          {/* Bottom row */}
          <div className="flex items-center justify-between mt-auto pt-5">
            <span className="text-xs text-slate-400 font-medium">
              {role.functionCount} functions
            </span>
            <span
              className={`text-sm font-medium ${colors.text} inline-flex items-center gap-1 group-hover:gap-2 transition-all`}
            >
              View Details
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
