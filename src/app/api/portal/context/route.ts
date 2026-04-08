import { NextRequest, NextResponse } from "next/server";

import { getUserFromRequest } from "@/lib/auth-server";
import { insertPortalAuditEvent } from "@/lib/portal-data";
import { supabaseAdmin } from "@/lib/supabase-admin";

function validateText(value: unknown, field: string, max = 4000) {
  const text = String(value || "").trim();
  if (!text) throw new Error(`${field} is required`);
  if (text.length > max) throw new Error(`${field} exceeds max length ${max}`);
  return text;
}

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const metadata = user.user_metadata || {};
  const contextSettings = metadata.context_settings && typeof metadata.context_settings === "object"
    ? metadata.context_settings
    : {};

  return NextResponse.json({ ok: true, context: contextSettings });
}

export async function PATCH(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await req.json().catch(() => ({}))) as {
      businessContext?: unknown;
      operatingConstraints?: unknown;
      preferredTone?: unknown;
    };

    const nextContext = {
      businessContext: validateText(body.businessContext, "businessContext"),
      operatingConstraints: validateText(body.operatingConstraints, "operatingConstraints"),
      preferredTone: validateText(body.preferredTone, "preferredTone", 500),
      updatedAt: new Date().toISOString(),
    };

    const existingMetadata = user.user_metadata || {};

    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...existingMetadata,
        context_settings: nextContext,
      },
    });
    if (error) throw new Error(error.message);

    await insertPortalAuditEvent({
      userId: user.id,
      eventType: "portal.context.updated",
      payload: nextContext,
      actor: `user:${user.id}`,
    });

    return NextResponse.json({ ok: true, context: nextContext });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed" }, { status: 400 });
  }
}
