import { NextRequest, NextResponse } from "next/server";

import { ADMIN_ALLOWED, ADMIN_MUTATION_ALLOWED, requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase-admin";

const db = supabaseAdmin.schema("nexius_os");

const SAFE_REF_RE = /^[a-zA-Z0-9._/\-]{1,120}$/;
const SAFE_OWNER_RE = /^[a-zA-Z0-9._\-]{1,80}$/;
const SAFE_REPO_RE = /^[a-zA-Z0-9._\-]{1,120}$/;
const SAFE_SUBDIR_RE = /^(?!\/)(?!.*\.\.)([a-zA-Z0-9._\-/]{1,240})$/;

function allowedSourcePairs() {
  return new Set(
    (process.env.GITEA_ALLOWED_SOURCES || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((pair) => pair.toLowerCase())
  );
}

function validateSource(params: {
  owner?: string | null;
  repo?: string | null;
  ref?: string | null;
  subdir?: string | null;
}) {
  const owner = String(params.owner || "").trim();
  const repo = String(params.repo || "").trim();
  const ref = String(params.ref || "").trim();
  const subdir = String(params.subdir || "").trim();

  const anyProvided = Boolean(owner || repo || ref || subdir);
  if (!anyProvided) return { owner: null, repo: null, ref: null, subdir: null };

  if (!owner || !repo || !ref) {
    throw new Error("source_owner, source_repo, and source_ref are required when source mapping is set");
  }
  if (!SAFE_OWNER_RE.test(owner)) throw new Error("source_owner contains invalid characters");
  if (!SAFE_REPO_RE.test(repo)) throw new Error("source_repo contains invalid characters");
  if (!SAFE_REF_RE.test(ref)) throw new Error("source_ref contains invalid characters");
  if (subdir && !SAFE_SUBDIR_RE.test(subdir)) throw new Error("source_subdir contains invalid characters");

  const allowlist = allowedSourcePairs();
  if (allowlist.size > 0 && !allowlist.has(`${owner}/${repo}`.toLowerCase())) {
    throw new Error("source owner/repo is not in allowlist");
  }

  return {
    owner,
    repo,
    ref,
    subdir: subdir || null,
  };
}

function appendAudit(metadata: unknown, event: Record<string, unknown>) {
  const base = metadata && typeof metadata === "object" ? { ...(metadata as Record<string, unknown>) } : {};
  const entries = Array.isArray(base.change_events)
    ? base.change_events.filter((item) => !!item && typeof item === "object").slice(-19)
    : [];
  return {
    ...base,
    last_changed_at: event.ts,
    last_changed_by: event.actor,
    last_action: event.action,
    change_events: [...entries, event],
  };
}

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ADMIN_ALLOWED);
  if (!auth.ok) return auth.response;

  const limit = Math.min(300, Math.max(1, Number(req.nextUrl.searchParams.get("limit") || "200")));
  const active = (req.nextUrl.searchParams.get("active") || "").trim();

  let query = db
    .from("sku_registry")
    .select(
      "id,sku_code,package_id,package_version,role_ids,active,source_owner,source_repo,source_ref,source_subdir,display_name,category,deprecated_at,metadata,updated_at"
    )
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (active === "true") query = query.eq("active", true);
  if (active === "false") query = query.eq("active", false);

  const { data, error } = await query;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, rows: data || [], role: auth.role });
}

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ADMIN_MUTATION_ALLOWED);
  if (!auth.ok) return auth.response;

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const action = String(body.action || "upsert").trim();
  const skuCode = String(body.skuCode || "").trim();
  if (!skuCode) return NextResponse.json({ ok: false, error: "skuCode is required" }, { status: 400 });

  const { data: existing, error: existingError } = await db
    .from("sku_registry")
    .select("id,metadata")
    .eq("sku_code", skuCode)
    .maybeSingle();
  if (existingError) return NextResponse.json({ ok: false, error: existingError.message }, { status: 500 });

  const now = new Date().toISOString();
  const actor = `admin:${auth.user.id}`;
  const eventBase = { ts: now, actor, action, skuCode };

  if (action === "deprecate") {
    if (!existing?.id) return NextResponse.json({ ok: false, error: "SKU not found" }, { status: 404 });

    const metadata = appendAudit(existing.metadata, eventBase);
    const { error } = await db
      .from("sku_registry")
      .update({
        active: false,
        deprecated_at: now,
        metadata,
        updated_at: now,
      })
      .eq("id", existing.id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, action, skuCode });
  }

  const packageId = String(body.packageId || "").trim();
  const packageVersion = String(body.packageVersion || "").trim();
  const roleIds = Array.isArray(body.roleIds) ? body.roleIds.map((value) => String(value).trim()).filter(Boolean) : [];
  if (!packageId || !packageVersion) {
    return NextResponse.json({ ok: false, error: "packageId and packageVersion are required" }, { status: 400 });
  }

  let source;
  try {
    source = validateSource({
      owner: typeof body.sourceOwner === "string" ? body.sourceOwner : null,
      repo: typeof body.sourceRepo === "string" ? body.sourceRepo : null,
      ref: typeof body.sourceRef === "string" ? body.sourceRef : null,
      subdir: typeof body.sourceSubdir === "string" ? body.sourceSubdir : null,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Invalid source mapping" }, { status: 400 });
  }

  const metadata = appendAudit(existing?.metadata, {
    ...eventBase,
    packageId,
    packageVersion,
    sourceOwner: source.owner,
    sourceRepo: source.repo,
    sourceRef: source.ref,
    sourceSubdir: source.subdir,
  });

  const payload = {
    sku_code: skuCode,
    package_id: packageId,
    package_version: packageVersion,
    role_ids: roleIds,
    active: true,
    source_owner: source.owner,
    source_repo: source.repo,
    source_ref: source.ref,
    source_subdir: source.subdir,
    display_name: body.displayName ? String(body.displayName) : null,
    category: body.category ? String(body.category) : null,
    metadata,
    updated_at: now,
    deprecated_at: null,
  };

  const { error } = await db.from("sku_registry").upsert(payload, { onConflict: "sku_code" });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, action: "upsert", skuCode });
}
