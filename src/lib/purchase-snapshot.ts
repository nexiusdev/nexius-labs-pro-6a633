import crypto from "crypto";

import { supabaseAdmin } from "@/lib/supabase-admin";

const db = supabaseAdmin.schema("nexius_os");

export type ResolvedSku = {
  skuCode: string;
  packageId: string;
  roleIds: string[];
  packageVersion: string;
};

export type PurchaseSnapshot = {
  contractVersion: "v2";
  tenantProfile: "runtime_plus_ui_supabase";
  skuCodes: string[];
  packageIds: string[];
  packageVersions: string[];
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
  }));
}

export async function resolveSkus(params: {
  skuCodes?: string[];
  roleIds?: string[];
}): Promise<ResolvedSku[]> {
  const requestedSkuCodes = uniq((params.skuCodes || []).map((value) => String(value).trim()));
  const requestedRoleIds = uniq((params.roleIds || []).map((value) => String(value).trim()));

  if (requestedSkuCodes.length === 0) {
    return buildFallbackFromRoles(requestedRoleIds);
  }

  const { data, error } = await db
    .from("sku_registry")
    .select("sku_code,package_id,role_ids,package_version")
    .in("sku_code", requestedSkuCodes)
    .eq("active", true);

  if (error) {
    throw new Error(`Failed to read SKU registry: ${error.message}`);
  }

  const bySku = new Map<string, ResolvedSku>();
  for (const row of data || []) {
    const skuCode = String(row.sku_code || "").trim();
    if (!skuCode) continue;

    bySku.set(skuCode, {
      skuCode,
      packageId: String(row.package_id || stableFallbackPackageId()),
      roleIds: Array.isArray(row.role_ids) ? row.role_ids.map((value: unknown) => String(value)) : [],
      packageVersion: String(row.package_version || stableFallbackPackageVersion()),
    });
  }

  const resolved: ResolvedSku[] = [];
  for (const skuCode of requestedSkuCodes) {
    const found = bySku.get(skuCode);
    if (found) {
      resolved.push(found);
      continue;
    }

    // Safe fallback keeps checkout operable even before registry is fully seeded.
    resolved.push({
      skuCode,
      packageId: stableFallbackPackageId(),
      roleIds: requestedRoleIds,
      packageVersion: stableFallbackPackageVersion(),
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

  return {
    contractVersion: "v2",
    tenantProfile: "runtime_plus_ui_supabase",
    skuCodes,
    packageIds,
    packageVersions,
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
