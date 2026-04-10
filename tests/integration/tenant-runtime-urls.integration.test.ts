import assert from "node:assert/strict";
import test from "node:test";

import { buildTenantRuntimeUrls } from "../../src/lib/tenant-runtime-urls";

test("buildTenantRuntimeUrls prefers explicit domains payload when provided", () => {
  const urls = buildTenantRuntimeUrls({
    customerId: "customer-domains",
    responsePayload: {
      domains: {
        publicHost: "tenant.example.com",
      },
    },
  });

  assert.equal(urls.source, "domains");
  assert.equal(urls.webchatUrl, "https://tenant.example.com/customer-domains/webchat/");
  assert.equal(urls.erpUrl, "https://tenant.example.com/customer-domains/erp");
});

test("buildTenantRuntimeUrls uses control public base env when domains are absent", () => {
  const previous = process.env.NEXIUS_CONTROL_PUBLIC_BASE_URL;
  process.env.NEXIUS_CONTROL_PUBLIC_BASE_URL = "https://control.example.com/v1/tenants/onboard";
  try {
    const urls = buildTenantRuntimeUrls({
      customerId: "customer-control-base",
      responsePayload: {},
      requestPayload: {},
    });
    assert.equal(urls.source, "control_base");
    assert.equal(
      urls.webchatUrl,
      "https://control.example.com/customer-control-base/webchat/"
    );
    assert.equal(urls.erpUrl, "https://control.example.com/customer-control-base/erp");
  } finally {
    if (previous === undefined) delete process.env.NEXIUS_CONTROL_PUBLIC_BASE_URL;
    else process.env.NEXIUS_CONTROL_PUBLIC_BASE_URL = previous;
  }
});

test("buildTenantRuntimeUrls falls back to dev base when control envs are missing", () => {
  const previousPublic = process.env.NEXIUS_CONTROL_PUBLIC_BASE_URL;
  const previousEndpoint = process.env.NEXIUS_CONTROL_ONBOARDING_URL;
  const previousBase = process.env.NEXIUS_CONTROL_BASE_URL;
  delete process.env.NEXIUS_CONTROL_PUBLIC_BASE_URL;
  delete process.env.NEXIUS_CONTROL_ONBOARDING_URL;
  delete process.env.NEXIUS_CONTROL_BASE_URL;
  try {
    const urls = buildTenantRuntimeUrls({
      customerId: "customer-fallback",
    });
    assert.equal(urls.source, "control_base");
    assert.equal(
      urls.webchatUrl,
      "https://dev.nexiusagent.com/customer-fallback/webchat/"
    );
    assert.equal(urls.erpUrl, "https://dev.nexiusagent.com/customer-fallback/erp");
  } finally {
    if (previousPublic === undefined) delete process.env.NEXIUS_CONTROL_PUBLIC_BASE_URL;
    else process.env.NEXIUS_CONTROL_PUBLIC_BASE_URL = previousPublic;
    if (previousEndpoint === undefined) delete process.env.NEXIUS_CONTROL_ONBOARDING_URL;
    else process.env.NEXIUS_CONTROL_ONBOARDING_URL = previousEndpoint;
    if (previousBase === undefined) delete process.env.NEXIUS_CONTROL_BASE_URL;
    else process.env.NEXIUS_CONTROL_BASE_URL = previousBase;
  }
});
