"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useInterviewHistory } from "@/context/InterviewHistoryContext";
import { useShortlist } from "@/context/ShortlistContext";

export default function MembershipPrompt() {
  const { user } = useAuth();
  const { count: shortlistCount } = useShortlist();
  const { count: interviewCount } = useInterviewHistory();

  if (user) return null;
  if (shortlistCount <= 2 && interviewCount <= 2) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur border-t border-slate-700 shadow-lg">
      <div className="container-wide py-2 text-sm text-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p>
          You already have {shortlistCount} shortlist and {interviewCount} interview records. Create an account to save and return anytime.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/auth?mode=signup" className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-500">Sign up</Link>
          <Link href="/auth?mode=signin" className="px-3 py-1.5 rounded-md border border-slate-500 text-slate-200 hover:border-slate-300 hover:text-white">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
