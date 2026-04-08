import { NextRequest, NextResponse } from "next/server";

import { getUserFromRequest } from "@/lib/auth-server";
import { insertPortalAuditEvent } from "@/lib/portal-data";
import { supabaseAdmin } from "@/lib/supabase-admin";

function validateOptionalText(value: unknown, field: string, max = 3000) {
  const text = String(value || "").trim();
  if (text.length > max) throw new Error(`${field} exceeds max length ${max}`);
  return text;
}

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const metadata = user.user_metadata || {};
  const agentSettings = metadata.agent_settings && typeof metadata.agent_settings === "object"
    ? metadata.agent_settings
    : {};

  return NextResponse.json({ ok: true, agent: agentSettings });
}

export async function PATCH(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await req.json().catch(() => ({}))) as {
      systemPrompt?: unknown;
      responseStyle?: unknown;
      autoRegenerate?: unknown;
    };

    const nextAgent = {
      systemPrompt: validateOptionalText(body.systemPrompt, "systemPrompt", 6000),
      responseStyle: validateOptionalText(body.responseStyle, "responseStyle", 1200),
      autoRegenerate: body.autoRegenerate === true,
      updatedAt: new Date().toISOString(),
    };

    const existingMetadata = user.user_metadata || {};

    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...existingMetadata,
        agent_settings: nextAgent,
      },
    });
    if (error) throw new Error(error.message);

    await insertPortalAuditEvent({
      userId: user.id,
      eventType: "portal.agent.updated",
      payload: nextAgent,
      actor: `user:${user.id}`,
    });

    return NextResponse.json({ ok: true, agent: nextAgent });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed" }, { status: 400 });
  }
}
