import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { resolveAppRole } from "@/lib/rbac";

function getBearerToken(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  return auth.startsWith("Bearer ") ? auth.slice(7) : null;
}

async function getAuthedUser(req: NextRequest) {
  const token = getBearerToken(req);
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

export async function GET(req: NextRequest) {
  const user = await getAuthedUser(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const metadata = user.user_metadata || {};
  return NextResponse.json({
    ok: true,
    profile: {
      email: user.email || "",
      appRole: resolveAppRole(user),
      fullName: typeof metadata.full_name === "string" ? metadata.full_name : "",
      company: typeof metadata.company === "string" ? metadata.company : "",
      telegramUserId: typeof metadata.telegram_user_id === "string" ? metadata.telegram_user_id : "",
    },
  });
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthedUser(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    fullName?: unknown;
    company?: unknown;
    telegramUserId?: unknown;
    password?: unknown;
  };

  const fullName = String(body.fullName || "").trim();
  const company = String(body.company || "").trim();
  const telegramUserId = String(body.telegramUserId || "").trim();
  const password = String(body.password || "").trim();

  if (telegramUserId && !/^\d{3,20}$/.test(telegramUserId)) {
    return NextResponse.json({ ok: false, error: "telegramUserId must be a numeric Telegram user id" }, { status: 400 });
  }
  if (password && password.length < 8) {
    return NextResponse.json({ ok: false, error: "password must be at least 8 characters" }, { status: 400 });
  }

  const update: {
    user_metadata: {
      full_name: string;
      company: string;
      telegram_user_id: string;
    };
    password?: string;
  } = {
    user_metadata: {
      full_name: fullName,
      company,
      telegram_user_id: telegramUserId,
    },
  };

  if (password) {
    update.password = password;
  }

  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(user.id, update);
  if (error || !data.user) {
    return NextResponse.json({ ok: false, error: error?.message || "Failed to update profile" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    profile: {
      email: data.user.email || "",
      appRole: resolveAppRole(data.user),
      fullName,
      company,
      telegramUserId,
    },
  });
}
