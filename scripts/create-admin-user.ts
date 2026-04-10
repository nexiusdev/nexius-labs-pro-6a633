import { hashAdminPassword } from "../src/lib/admin-auth";
import { supabaseAdmin } from "../src/lib/supabase-admin";

const db = supabaseAdmin.schema("nexius_os");

async function main() {
  const [usernameArg, passwordArg, roleArg] = process.argv.slice(2);
  const username = String(usernameArg || "").trim().toLowerCase();
  const password = String(passwordArg || "");
  const role = String(roleArg || "super_admin").trim() || "super_admin";

  if (!username || !password) {
    throw new Error("Usage: tsx scripts/create-admin-user.ts <username> <password> [role]");
  }

  const passwordHash = await hashAdminPassword(password);
  const now = new Date().toISOString();

  const { error } = await db.from("admin_users").upsert(
    {
      username,
      password_hash: passwordHash,
      role,
      status: "active",
      updated_at: now,
      created_by: "script:create-admin-user",
      updated_by: "script:create-admin-user",
    },
    { onConflict: "username" }
  );

  if (error) throw new Error(error.message);
  console.log(JSON.stringify({ ok: true, username, role }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
