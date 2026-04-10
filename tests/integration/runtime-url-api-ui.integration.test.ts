import assert from "node:assert/strict";
import test from "node:test";

import {
  buildOnboardingJobUrlsFromDb,
  buildWorkspaceUrlsFromLatestJob,
} from "../../src/lib/runtime-url-api";
import {
  hasRuntimeUrls,
  shouldShowOnboardingReadyActions,
  shouldShowWorkspaceReadyActions,
} from "../../src/lib/runtime-url-ui";

test("API helper: onboarding response urls include webchat and erp keys", () => {
  const urls = buildOnboardingJobUrlsFromDb({
    customer_id: "customer-api",
    response_payload: {
      tenant_urls: {
        webchat: "https://dev.nexiusagent.com/customer-api/webchat/",
        erp: "https://dev.nexiusagent.com/customer-api/erp",
      },
    },
  });

  assert.ok(Object.prototype.hasOwnProperty.call(urls, "webchatUrl"));
  assert.ok(Object.prototype.hasOwnProperty.call(urls, "erpUrl"));
  assert.equal(urls.webchatUrl, "https://dev.nexiusagent.com/customer-api/webchat/");
  assert.equal(urls.erpUrl, "https://dev.nexiusagent.com/customer-api/erp");
});

test("API helper: workspace urls resolve from latest job shape", () => {
  const urls = buildWorkspaceUrlsFromLatestJob({
    customer_id: "customer-workspace",
    request_payload: {
      domains: {
        publicHost: "tenant.example.com",
      },
    },
    response_payload: {},
  });

  assert.equal(urls.webchatUrl, "https://tenant.example.com/customer-workspace/webchat/");
  assert.equal(urls.erpUrl, "https://tenant.example.com/customer-workspace/erp");
});

test("UI helper: onboarding ready actions only show when completed with urls", () => {
  const urls = {
    webchatUrl: "https://dev.nexiusagent.com/customer-ui/webchat/",
    erpUrl: "https://dev.nexiusagent.com/customer-ui/erp",
  };
  assert.equal(shouldShowOnboardingReadyActions("completed", urls), true);
  assert.equal(shouldShowOnboardingReadyActions("in_progress", urls), false);
  assert.equal(shouldShowOnboardingReadyActions("completed", { webchatUrl: null, erpUrl: null }), false);
});

test("UI helper: workspace ready actions only show when ready with urls", () => {
  const urls = {
    webchatUrl: null,
    erpUrl: "https://dev.nexiusagent.com/customer-ui/erp",
  };
  assert.equal(hasRuntimeUrls(urls), true);
  assert.equal(shouldShowWorkspaceReadyActions("ready", urls), true);
  assert.equal(shouldShowWorkspaceReadyActions("installing", urls), false);
  assert.equal(shouldShowWorkspaceReadyActions("ready", { webchatUrl: null, erpUrl: null }), false);
});
