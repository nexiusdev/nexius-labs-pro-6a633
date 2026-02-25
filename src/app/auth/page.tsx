"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function AuthPage() {
  const [mode, setMode] = useState<"signup" | "signin">("signup");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const m = new URLSearchParams(window.location.search).get("mode");
    setMode(m === "signin" ? "signin" : "signup");
  }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!supabaseBrowser) {
      setMessage("Auth is not configured. Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      if (mode === "signup") {
        const { error } = await supabaseBrowser.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Sign-up successful. Check your inbox if email verification is enabled, then sign in.");
      } else {
        const { error } = await supabaseBrowser.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage("Signed in. You can now continue with your saved shortlists/interviews.");
      }
    } catch (e) {
      setMessage((e as Error).message || "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-slate-50 pt-28 pb-16">
        <div className="container-wide max-w-xl">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h1 className="text-2xl font-bold text-slate-900">{mode === "signup" ? "Create account" : "Sign in"}</h1>
            <p className="text-sm text-slate-500 mt-1">Save your shortlists and interview history so you can return anytime.</p>

            <div className="mt-5 space-y-3">
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2.5" />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2.5" />
              <button onClick={submit} disabled={busy} className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2.5 font-medium disabled:opacity-60">
                {busy ? "Please wait..." : mode === "signup" ? "Sign up" : "Sign in"}
              </button>
            </div>

            {message && <p className="mt-3 text-sm text-slate-700">{message}</p>}

            <p className="mt-4 text-sm text-slate-600">
              {mode === "signup" ? "Already have an account?" : "Need an account?"} {" "}
              <Link className="text-blue-600" href={mode === "signup" ? "/auth?mode=signin" : "/auth?mode=signup"}>
                {mode === "signup" ? "Sign in" : "Sign up"}
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
