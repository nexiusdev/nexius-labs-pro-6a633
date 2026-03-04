"use client";

import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://cqqkrheyjtdysclkeuxn.supabase.co";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseBrowser =
  url && anon ? createClient(url, anon) : null;
