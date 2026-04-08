import crypto from "crypto";

import { supabaseAdmin } from "@/lib/supabase-admin";

const db = supabaseAdmin.schema("nexius_os");

export type ResolvedSku = {
  skuCode: string;
  packageId: string;
  roleIds: string[];
  packageVersion: string;
  sourceOwner: string | null;
  sourceRepo: string | null;
  sourceRef: string | null;
  sourceSubdir: string | null;
};

export type PackageSourceSnapshotEntry = {
  packageId: string;
  owner: string;
  repo: string;
  ref: string;
  subdir: string | null;
};

export type PurchaseSnapshot = {
  contractVersion: "v2";
  tenantProfile: "runtime_plus_ui_supabase";
  skuCodes: string[];
  packageIds: string[];
  packageVersions: string[];
  packageSources: PackageSourceSnapshotEntry[];
  roleIds: string[];
  capturedAt: string;
};

function uniq(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function stableFallbackPackageVersion() {
  return (process.env.DEFAULT_PACKAGE_VERSION || "2026.04.0").trim();
}

function stableFallbackPackageId() {
  return (process.env.DEFAULT_PACKAGE_ID || "runtime_plus_ui_supabase").trim();
}

function buildFallbackFromRoles(roleIds: string[]): ResolvedSku[] {
  const packageId = stableFallbackPackageId();
  const packageVersion = stableFallbackPackageVersion();

  return roleIds.map((roleId) => ({
    skuCode: `role:${roleId}`,
    packageId,
    roleIds: [roleId],
    packageVersion,
    sourceOwner: null,
    sourceRepo: null,
    sourceRef: null,
    sourceSubdir: null,
  }));
}

function fromRegistryRow(row: Record<string, unknown>): ResolvedSku {
  return {
    skuCode: String(row.sku_code || "").trim(),
    packageId: String(row.package_id || stableFallbackPackageId()),
    roleIds: Array.isArray(row.role_ids) ? row.role_ids.map((value: unknown) => String(value)) : [],
    packageVersion: String(row.package_version || stableFallbackPackageVersion()),
    sourceOwner: row.source_owner ? String(row.source_owner) : null,
    sourceRepo: row.source_repo ? String(row.source_repo) : null,
    sourceRef: row.source_ref ? String(row.source_ref) : null,
    sourceSubdir: row.source_subdir ? String(row.source_subdir) : null,
  };
}

async function resolveSkusFromRoles(roleIds: string[]): Promise<ResolvedSku[]> {
  if (roleIds.length === 0) return [];

  const { data, error } = await db
    .from("sku_registry")
    .select("sku_code,package_id,role_ids,package_version,source_owner,source_repo,source_ref,source_subdir")
    .eq("active", true)
    .overlaps("role_ids", roleIds);

  if (error) {
    throw new Error(`Failed to infer SKU registry mappings: ${error.message}`);
  }

  const candidates = (data || []).map((row) => fromRegistryRow(row as Record<string, unknown>));
  if (candidates.length === 0) {
    return buildFallbackFromRoles(roleIds);
  }

  const exactOrCovering = candidates
    .filter((candidate) => roleIds.every((roleId) => candidate.roleIds.includes(roleId)))
    .sort((a, b) => a.roleIds.length - b.roleIds.length || a.packageId.localeCompare(b.packageId));

  if (exactOrCovering.length > 0) {
    return [exactOrCovering[0]];
  }

  const resolved = new Map<string, ResolvedSku>();
  for (const roleId of roleIds) {
    const best = candidates
      .filter((candidate) => candidate.roleIds.includes(roleId))
      .sort((a, b) => a.roleIds.length - b.roleIds.length || a.packageId.localeCompare(b.packageId))[0];

    if (best) {
      resolved.set(best.skuCode, best);
      continue;
    }

    const [fallback] = buildFallbackFromRoles([roleId]);
    resolved.set(fallback.skuCode, fallback);
  }

  return [...resolved.values()];
}

export async function resolveSkus(params: {
  skuCodes?: string[];
  roleIds?: string[];
}): Promise<ResolvedSku[]> {
  const requestedSkuCodes = uniq((params.skuCodes || []).map((value) => String(value).trim()));
  const requestedRoleIds = uniq((params.roleIds || []).map((value) => String(value).trim()));

  if (requestedSkuCodes.length === 0) {
    return resolveSkusFromRoles(requestedRoleIds);
  }

  const { data, error } = await db
    .from("sku_registry")
    .select("sku_code,package_id,role_ids,package_version,source_owner,source_repo,source_ref,source_subdir")
    .in("sku_code", requestedSkuCodes)
    .eq("active", true);

  if (error) {
    throw new Error(`Failed to read SKU registry: ${error.message}`);
  }

  const bySku = new Map<string, ResolvedSku>();
  for (const row of data || []) {
    const resolved = fromRegistryRow(row as Record<string, unknown>);
    const skuCode = resolved.skuCode;
    if (!skuCode) continue;
    bySku.set(skuCode, resolved);
  }

  const resolved: ResolvedSku[] = [];
  for (const skuCode of requestedSkuCodes) {
    const found = bySku.get(skuCode);
    if (found) {
      resolved.push(found);
      continue;
    }

    // Safe fallback keeps checkout operable even before registry is fully seeded.
    console.warn(`[purchase-snapshot] missing sku_registry mapping for sku=${skuCode}; using fallback package`);
    resolved.push({
      skuCode,
      packageId: stableFallbackPackageId(),
      roleIds: requestedRoleIds,
      packageVersion: stableFallbackPackageVersion(),
      sourceOwner: null,
      sourceRepo: null,
      sourceRef: null,
      sourceSubdir: null,
    });
  }

  return resolved;
}

export async function buildPurchaseSnapshot(params: {
  skuCodes?: string[];
  roleIds?: string[];
}): Promise<PurchaseSnapshot> {
  const resolved = await resolveSkus(params);

  const roleIds = uniq(resolved.flatMap((item) => item.roleIds));
  const skuCodes = uniq(resolved.map((item) => item.skuCode));
  const packageIds = uniq(resolved.map((item) => item.packageId));
  const packageVersions = uniq(resolved.map((item) => item.packageVersion));
  const packageSourceByKey = new Map<string, PackageSourceSnapshotEntry>();
  for (const item of resolved) {
    if (!item.sourceOwner || !item.sourceRepo || !item.sourceRef) continue;
    const key = `${item.packageId}|${item.sourceOwner}|${item.sourceRepo}|${item.sourceRef}|${item.sourceSubdir || ""}`;
    packageSourceByKey.set(key, {
      packageId: item.packageId,
      owner: item.sourceOwner,
      repo: item.sourceRepo,
      ref: item.sourceRef,
      subdir: item.sourceSubdir || null,
    });
  }
  const packageSources = [...packageSourceByKey.values()];

  return {
    contractVersion: "v2",
    tenantProfile: "runtime_plus_ui_supabase",
    skuCodes,
    packageIds,
    packageVersions,
    packageSources,
    roleIds,
    capturedAt: new Date().toISOString(),
  };
}

export function buildFulfillmentIdempotencyKey(subscriptionId: string) {
  return `fulfill-sub-${subscriptionId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

export function buildFulfillmentCorrelationId() {
  return `corr_${crypto.randomUUID().replace(/-/g, "")}`;
}
