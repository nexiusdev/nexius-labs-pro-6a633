import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
if (!anon) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");

const supabaseAnon = createClient(url, anon);
const supabaseAdmin = serviceRole
  ? createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

async function tryQuery(label: string, client: any) {
  const { count, error } = await client
    .schema("nexius_os")
    .from("roles")
    .select("id", { count: "exact", head: true });

  if (error) throw error;
  return count;
}

async function main() {
  console.log("Testing Supabase at:", url);

  // 1) Try anon (this is what the browser will use)
  try {
    const count = await tryQuery("anon", supabaseAnon);
    console.log("OK (anon): nexius_os.roles count =", count);
    return;
  } catch (e: any) {
    console.error("Anon query failed (often due to RLS).", e);
  }

  // 2) Fallback to service role (server-side only) to confirm data exists.
  if (!supabaseAdmin) {
    throw new Error(
      "Anon failed and SUPABASE_SERVICE_ROLE_KEY is missing, cannot verify via admin client."
    );
  }

  const adminCount = await tryQuery("service_role", supabaseAdmin);
  console.log("OK (service_role): nexius_os.roles count =", adminCount);
  console.log(
    "If anon failed, you likely need to add/select RLS policies to allow reads for the frontend."
  );
}

main().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
