import { buildTenantRuntimeUrls } from "@/lib/tenant-runtime-urls";

type JobLike = {
  customer_id?: unknown;
  response_payload?: unknown;
  request_payload?: unknown;
};

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

export function buildOnboardingJobUrlsFromDb(job: JobLike) {
  const customerId = String(job.customer_id || "").trim();
  if (!customerId) return { webchatUrl: null, erpUrl: null, source: "none" as const };

  return buildTenantRuntimeUrls({
    customerId,
    responsePayload: asObject(job.response_payload),
    requestPayload: asObject(job.request_payload),
  });
}

export function buildWorkspaceUrlsFromLatestJob(latest: JobLike | null | undefined) {
  if (!latest) return { webchatUrl: null, erpUrl: null, source: "none" as const };
  return buildOnboardingJobUrlsFromDb(latest);
}
