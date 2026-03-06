import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const db = supabaseAdmin.schema("nexius_os");

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const fullName = String(body?.fullName ?? "").trim();
  const telegramUsername = String(body?.telegramUsername ?? "").trim();
  const telegramBotToken = String(body?.telegramBotToken ?? "").trim();

  const roleIds: string[] = Array.isArray(body?.roleIds)
    ? body.roleIds.map((x: unknown) => String(x).trim()).filter(Boolean)
    : [];

  const currency = String(body?.currency ?? "SGD").trim() || "SGD";
  const monthlyTotalRaw = body?.monthlyTotal;
  const monthlyTotal = typeof monthlyTotalRaw === "number" && Number.isFinite(monthlyTotalRaw)
    ? monthlyTotalRaw
    : typeof monthlyTotalRaw === "string" && monthlyTotalRaw.trim() !== "" && Number.isFinite(Number(monthlyTotalRaw))
      ? Number(monthlyTotalRaw)
      : null;

  if (!fullName || !telegramUsername || !telegramBotToken) {
    return NextResponse.json(
      { error: "fullName, telegramUsername, telegramBotToken are required" },
      { status: 400 }
    );
  }

  const { error } = await db.from("payment_onboarding").insert({
    full_name: fullName,
    telegram_username: telegramUsername,
    telegram_bot_token: telegramBotToken,
    role_ids: roleIds,
    currency,
    monthly_total: monthlyTotal,
    source_page: body?.sourcePage ?? null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
