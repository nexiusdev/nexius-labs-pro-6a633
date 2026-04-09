import assert from "node:assert/strict";
import { before } from "node:test";
import test from "node:test";

process.env.SUPABASE_URL = process.env.SUPABASE_URL || "https://example.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "dummy";
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://example.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy";

let buildControlPackages: typeof import("../../src/lib/fulfillment").buildControlPackages;
let dispatchControlWithAssignFallback: typeof import("../../src/lib/fulfillment").dispatchControlWithAssignFallback;
let buildAssignExistingIdempotencyKey: typeof import("../../src/lib/fulfillment").buildAssignExistingIdempotencyKey;

before(async () => {
  const mod = await import("../../src/lib/fulfillment");
  buildControlPackages = mod.buildControlPackages;
  dispatchControlWithAssignFallback = mod.dispatchControlWithAssignFallback;
  buildAssignExistingIdempotencyKey = mod.buildAssignExistingIdempotencyKey;
});

test("dispatch fallback: TENANT_ALREADY_ASSIGNED triggers assign_existing retry with dedicated idempotency key", async () => {
  const calls: Array<{ idempotencyKey: string; payload: Record<string, unknown> }> = [];

  const result = await dispatchControlWithAssignFallback({
    onboardingJobId: "job-1",
    subscriptionId: "sub_123",
    correlationId: "corr_1",
    baseIdempotencyKey: "fulfill-sub-sub_123",
    initialProvisionMode: "create_new",
    requestPayload: {
      contractVersion: "v2",
      customerId: "customer-abc",
      subscriptionId: "sub_123",
      packages: [
        {
          packageId: "runtime_plus_ui_supabase",
          version: "2026.04.0",
          source: { owner: "nexiusdev", repo: "packages", ref: "main", subdir: "runtime" },
        },
      ],
    },
    dispatchFn: async ({ idempotencyKey, payload }) => {
      calls.push({ idempotencyKey, payload });
      if (calls.length === 1) {
        return {
          response: {
            ok: false,
            status: 409,
            body: {
              error_code: "TENANT_ALREADY_ASSIGNED",
              message: "already assigned",
              request_id: "req_first",
            },
          },
          transportAttempts: 1,
        };
      }

      return {
        response: {
          ok: true,
          status: 200,
          body: {
            state: "in_progress",
            request_id: "req_second",
          },
        },
        transportAttempts: 1,
      };
    },
  });

  assert.equal(calls.length, 2);
  assert.equal(String(calls[0].payload.provisionMode), "create_new");
  assert.equal(String(calls[1].payload.provisionMode), "assign_existing");
  assert.equal(calls[1].idempotencyKey, buildAssignExistingIdempotencyKey("sub_123"));
  assert.equal(result.fallbackUsed, true);
  assert.equal(result.attempts.length, 2);
  assert.equal(result.attempts[0].httpStatus, 409);
  assert.equal(result.attempts[0].errorCode, "TENANT_ALREADY_ASSIGNED");
  assert.equal(result.attempts[1].httpStatus, 200);
  assert.equal(result.attempts[1].requestId, "req_second");
});

test("dispatch fallback: non-TENANT_ALREADY_ASSIGNED error does not trigger fallback", async () => {
  const calls: Array<{ idempotencyKey: string; payload: Record<string, unknown> }> = [];

  const result = await dispatchControlWithAssignFallback({
    onboardingJobId: "job-2",
    subscriptionId: "sub_456",
    correlationId: "corr_2",
    baseIdempotencyKey: "fulfill-sub-sub_456",
    initialProvisionMode: "create_new",
    requestPayload: {
      contractVersion: "v2",
      customerId: "customer-def",
      subscriptionId: "sub_456",
      packages: [],
    },
    dispatchFn: async ({ idempotencyKey, payload }) => {
      calls.push({ idempotencyKey, payload });
      return {
        response: {
          ok: false,
          status: 503,
          body: {
            error_code: "NEXIUS_CONTROL_ONBOARDING_NETWORK_ERROR",
            message: "network",
            request_id: "req_only",
          },
        },
        transportAttempts: 1,
      };
    },
  });

  assert.equal(calls.length, 1);
  assert.equal(result.fallbackUsed, false);
  assert.equal(result.attempts.length, 1);
  assert.equal(result.attempts[0].errorCode, "NEXIUS_CONTROL_ONBOARDING_NETWORK_ERROR");
});

test("control package payload always includes packageId/version/source keys", () => {
  const packages = buildControlPackages({
    packageIds: ["pkg-a", "pkg-b"],
    packageVersions: ["1.0.0", "2.0.0"],
    packageSources: [
      {
        packageId: "pkg-a",
        owner: "nexiusdev",
        repo: "pkg-a-repo",
        ref: "main",
        subdir: "deploy/a",
      },
    ],
  });

  assert.equal(packages.length, 2);
  assert.deepEqual(Object.keys(packages[0]).sort(), ["packageId", "source", "version"]);
  assert.deepEqual(Object.keys(packages[0].source as Record<string, unknown>).sort(), ["owner", "ref", "repo", "subdir"]);
  assert.deepEqual(Object.keys(packages[1].source as Record<string, unknown>).sort(), ["owner", "ref", "repo", "subdir"]);
  assert.equal((packages[1].source as Record<string, unknown>).owner, null);
  assert.equal((packages[1].source as Record<string, unknown>).repo, null);
  assert.equal((packages[1].source as Record<string, unknown>).ref, null);
  assert.equal((packages[1].source as Record<string, unknown>).subdir, null);
});
