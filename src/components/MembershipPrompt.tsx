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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-amber-50 border-t border-amber-200 shadow-lg">
      <div className="container-wide py-2 text-sm text-amber-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p>
          You already have {shortlistCount} shortlist and {interviewCount} interview records. Create an account to save and return anytime.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/auth?mode=signup" className="px-3 py-1.5 rounded-md bg-amber-600 text-white hover:bg-amber-500">Sign up</Link>
          <Link href="/auth?mode=signin" className="px-3 py-1.5 rounded-md border border-amber-400 hover:border-amber-500">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
