type RuntimeUrlResult = {
  webchatUrl: string | null;
  erpUrl: string | null;
  source: "domains" | "control_base" | "fallback" | "none";
};

function normalizeBaseUrl(raw: string | null | undefined): string | null {
  const value = String(raw || "").trim();
  if (!value) return null;
  try {
    const parsed = new URL(value);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return null;
  }
}

function resolveControlBaseUrl(): string | null {
  const explicitPublic = normalizeBaseUrl(process.env.NEXIUS_CONTROL_PUBLIC_BASE_URL);
  if (explicitPublic) return explicitPublic;

  const explicitEndpoint = normalizeBaseUrl(process.env.NEXIUS_CONTROL_ONBOARDING_URL);
  if (explicitEndpoint) return explicitEndpoint;

  const base = normalizeBaseUrl(process.env.NEXIUS_CONTROL_BASE_URL);
  if (base) return base;

  return normalizeBaseUrl("https://dev.nexiusagent.com");
}

function normalizePath(raw: string | null | undefined, fallback: string, trailingSlash: boolean): string {
  let path = String(raw || "").trim() || fallback;
  if (!path.startsWith("/")) path = `/${path}`;
  path = path.replace(/\/{2,}/g, "/");
  if (trailingSlash) {
    if (!path.endsWith("/")) path = `${path}/`;
  } else if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  return path;
}

function payloadDomains(payload: Record<string, unknown>) {
  const raw = payload.domains;
  if (!raw || typeof raw !== "object") return {} as Record<string, unknown>;
  return raw as Record<string, unknown>;
}

export function buildTenantRuntimeUrls(params: {
  customerId: string;
  responsePayload?: Record<string, unknown>;
  requestPayload?: Record<string, unknown>;
}): RuntimeUrlResult {
  const customerId = String(params.customerId || "").trim();
  if (!customerId) return { webchatUrl: null, erpUrl: null, source: "none" };

  const responseDomains = payloadDomains(params.responsePayload || {});
  const requestDomains = payloadDomains(params.requestPayload || {});
  const domains = { ...requestDomains, ...responseDomains };

  const defaultWebchatPath = `/${customerId}/webchat`;
  const defaultErpPath = `/${customerId}/erp`;
  const webchatPath = normalizePath(
    typeof domains.webchatBasePath === "string" ? domains.webchatBasePath : null,
    defaultWebchatPath,
    true
  );
  const erpPath = normalizePath(
    typeof domains.erpBasePath === "string" ? domains.erpBasePath : null,
    defaultErpPath,
    false
  );

  const webchatDomain = typeof domains.webchat === "string" ? domains.webchat.trim() : "";
  const erpDomain = typeof domains.erpDashboard === "string" ? domains.erpDashboard.trim() : "";
  const publicHost = typeof domains.publicHost === "string" ? domains.publicHost.trim() : "";

  if (webchatDomain || erpDomain || publicHost) {
    const host = publicHost || null;
    const webchatUrl = webchatDomain
      ? `https://${webchatDomain}${webchatPath}`
      : host
        ? `https://${host}${webchatPath}`
        : null;
    const erpUrl = erpDomain
      ? `https://${erpDomain}${erpPath}`
      : host
        ? `https://${host}${erpPath}`
        : null;
    return { webchatUrl, erpUrl, source: "domains" };
  }

  const base = resolveControlBaseUrl();
  if (base) {
    return {
      webchatUrl: `${base}${webchatPath}`,
      erpUrl: `${base}${erpPath}`,
      source: "control_base",
    };
  }

  return {
    webchatUrl: null,
    erpUrl: null,
    source: "fallback",
  };
}
