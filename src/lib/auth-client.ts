"use client";

import { supabaseBrowser } from "@/lib/supabase-browser";

export async function getAccessToken() {
  if (!supabaseBrowser) return null;
  const { data } = await supabaseBrowser.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function getAuthHeaders() {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
