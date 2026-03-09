"use client";

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Intentionally no fallback URL: prevent accidentally pointing at an old/incorrect project.
export const supabaseBrowser = url && anon ? createClient(url, anon) : null;
