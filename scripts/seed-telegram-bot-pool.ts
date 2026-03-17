import { Client } from "pg";
import fs from "fs";

type BotSeed = {
  bot_username: string;
  token_secret_ref?: string;
  encrypted_token?: string;
  status?: string;
};

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

function loadSeeds(): BotSeed[] {
  const filePath = process.argv[2];
  if (!filePath) {
    throw new Error("Usage: tsx scripts/seed-telegram-bot-pool.ts <json-file>");
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("Seed file must be a JSON array");
  }

  return parsed.map((row) => {
    const seed = row as BotSeed;
    if (!seed.bot_username) throw new Error("Each bot seed requires bot_username");
    if (!seed.token_secret_ref && !seed.encrypted_token) {
      throw new Error(`Bot ${seed.bot_username} requires token_secret_ref or encrypted_token`);
    }
    return {
      bot_username: seed.bot_username,
      token_secret_ref: seed.token_secret_ref,
      encrypted_token: seed.encrypted_token,
      status: seed.status || "active",
    };
  });
}

async function main() {
  const seeds = loadSeeds();
  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query("begin");

    for (const bot of seeds) {
      await client.query(
        `insert into nexius_os.telegram_bot_pool
          (bot_username, token_secret_ref, encrypted_token, status, created_by, updated_by, last_action, last_action_at)
         values ($1,$2,$3,$4,$5,$5,$6,now())
         on conflict (bot_username)
         do update set
           token_secret_ref = excluded.token_secret_ref,
           encrypted_token = excluded.encrypted_token,
           status = excluded.status,
           updated_by = excluded.updated_by,
           last_action = excluded.last_action,
           last_action_at = excluded.last_action_at,
           updated_at = now()`,
        [
          bot.bot_username,
          bot.token_secret_ref || null,
          bot.encrypted_token || null,
          bot.status,
          "script:seed-telegram-bot-pool",
          "seed_or_update",
        ]
      );
    }

    await client.query("commit");
    console.log(`Seeded ${seeds.length} Telegram bot records.`);
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
