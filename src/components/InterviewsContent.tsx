"use client";

import { useState } from "react";
import Link from "next/link";
import { Mic, Trash2, ChevronDown, ChevronUp, Clock, MessageCircle } from "lucide-react";
import { useInterviewHistory } from "@/context/InterviewHistoryContext";
import { getRoleById, departmentColors } from "@/data/roles";

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function InterviewsContent() {
  const { sessions, interviewedRoleIds, deleteSession, clearAll } = useInterviewHistory();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Sort by most recently active
  const sortedIds = [...interviewedRoleIds].sort(
    (a, b) => (sessions[b]?.lastActiveAt ?? 0) - (sessions[a]?.lastActiveAt ?? 0)
  );

  const totalMessages = sortedIds.reduce((sum, id) => {
    const s = sessions[id];
    return sum + (s ? s.messages.filter((m) => m.role === "user").length : 0);
  }, 0);

  return (
    <div className="lg:grid lg:grid-cols-3 lg:gap-8">
      {/* Left column (2/3) */}
      <div className="lg:col-span-2">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
          Interview History
        </h1>
        <p className="text-slate-500 mt-2">
          Track your interview sessions with digital colleagues. Review past conversations and continue where you left off.
        </p>

        {sortedIds.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 mt-8">
            <p className="text-slate-500 text-lg">No interviews yet.</p>
            <p className="text-slate-400 mt-2">
              Browse roles and click &ldquo;Interview&rdquo; to start a conversation with any digital colleague.
            </p>
            <Link
              href="/roles"
              className="mt-4 inline-flex items-center bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-lg font-semibold transition-colors text-sm uppercase tracking-wide"
            >
              Explore Roles
            </Link>
          </div>
        ) : (
          <div className="space-y-4 mt-8">
            {sortedIds.map((roleId) => {
              const role = getRoleById(roleId);
              const session = sessions[roleId];
              if (!role || !session) return null;

              const colors = departmentColors[role.department];
              const isExpanded = expandedId === roleId;
              const userMessages = session.messages.filter((m) => m.role === "user").length;
              const chatMessages = session.messages.filter((m) => m.role !== "system");

              return (
                <div
                  key={roleId}
                  className={`bg-white rounded-xl border border-slate-100 border-l-4 ${colors.border} overflow-hidden`}
                >
                  {/* Header row */}
                  <div className="p-5 flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
                          {role.department}
                        </span>
                        <span className="text-xs text-slate-400">
                          {userMessages} {userMessages === 1 ? "question" : "questions"} asked
                        </span>
                      </div>
                      <Link
                        href={`/interview/${role.id}`}
                        className="text-lg font-semibold text-slate-900 hover:text-blue-600 transition-colors mt-1 block"
                      >
                        {role.title}
                      </Link>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Started {formatTime(session.startedAt)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          Last active {formatTime(session.lastActiveAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Continue interview */}
                      <Link
                        href={`/interview/${role.id}`}
                        className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Mic className="w-3.5 h-3.5" />
                        Continue
                      </Link>
                      {/* Expand/collapse */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : roleId)}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-2"
                        aria-label={isExpanded ? "Collapse chat" : "Expand chat"}
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => deleteSession(roleId)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-2"
                        aria-label={`Delete ${role.title} interview`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Expandable chat history */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-5">
                      <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {chatMessages.map((msg, i) => (
                          <div
                            key={i}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                                msg.role === "user"
                                  ? "bg-slate-800 text-white rounded-br-sm"
                                  : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm"
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right column: Summary (1/3) */}
      <div className="mt-8 lg:mt-0">
        <div className="bg-white rounded-xl border-l-4 border-blue-500 border border-slate-100 p-6 sticky top-24">
          <h2 className="text-xl font-bold text-slate-900">Interview Summary</h2>

          <div className="mt-4 space-y-3 text-sm">
            <p className="text-slate-600">
              Roles interviewed:{" "}
              <span className="font-semibold text-slate-900">{sortedIds.length}</span>
            </p>
            <p className="text-slate-600">
              Total questions asked:{" "}
              <span className="font-semibold text-slate-900">{totalMessages}</span>
            </p>
            <p className="text-slate-600">
              Departments covered:{" "}
              <span className="font-semibold text-slate-900">
                {[...new Set(sortedIds.map((id) => getRoleById(id)?.department).filter(Boolean))].join(", ") || "None yet"}
              </span>
            </p>
          </div>

          <p className="text-xs text-slate-500 mt-4 leading-relaxed">
            Click any role to continue the interview where you left off. Expand a session to review the full chat history.
          </p>

          <div className="mt-4 space-y-3">
            <Link
              href="/roles"
              className="w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-lg font-semibold transition-colors text-sm uppercase tracking-wide"
            >
              Interview More Roles
            </Link>
            {sortedIds.length > 0 && (
              <button
                onClick={clearAll}
                className="w-full inline-flex items-center justify-center border-2 border-red-200 text-red-500 hover:border-red-400 hover:text-red-600 px-5 py-3 rounded-lg font-semibold transition-colors text-sm uppercase tracking-wide"
              >
                Clear All History
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
