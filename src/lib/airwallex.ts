import crypto from "crypto";

type AirwallexEnv = "sandbox" | "production";

function requiredEnv(name: string): string {
  const v = (process.env[name] || "").trim();
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

export function getAirwallexEnv(): AirwallexEnv {
  const env = (process.env.AIRWALLEX_ENV || "sandbox").trim().toLowerCase();
  return env === "production" ? "production" : "sandbox";
}

export function getAirwallexBaseUrl(): string {
  const env = getAirwallexEnv();
  const explicit = (process.env.AIRWALLEX_BASE_URL || "").trim();
  const base = explicit || (env === "production" ? "https://api.airwallex.com" : "https://api-demo.airwallex.com");

  // Safety guardrails: avoid mismatching env + base URL.
  if (env === "sandbox" && /api\.airwallex\.com/i.test(base)) {
    throw new Error("AIRWALLEX_ENV=sandbox but AIRWALLEX_BASE_URL looks like production");
  }
  if (env === "production" && /api-demo\.airwallex\.com/i.test(base)) {
    throw new Error("AIRWALLEX_ENV=production but AIRWALLEX_BASE_URL looks like sandbox");
  }

  return base.replace(/\/$/, "");
}

let cachedToken: { token: string; expiresAtMs: number } | null = null;

/**
 * Obtain and cache an access token. Airwallex tokens are typically short-lived (~30 mins).
 * Docs recommend reusing until expiry.
 */
export async function getAirwallexAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAtMs - now > 60_000) return cachedToken.token;

  const baseUrl = getAirwallexBaseUrl();
  const clientId = requiredEnv("AIRWALLEX_CLIENT_ID");
  const apiKey = requiredEnv("AIRWALLEX_API_KEY");

  // Per Airwallex docs/Postman: use x-client-id and x-api-key headers.
  const res = await fetch(`${baseUrl}/api/v1/authentication/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-client-id": clientId,
      "x-api-key": apiKey,
    },
    body: JSON.stringify({}),
    cache: "no-store",
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || json?.error?.message || `Airwallex login failed (${res.status})`);
  }

  const token = String(json?.token || json?.access_token || "");
  if (!token) throw new Error("Airwallex login: missing token in response");

  // Best effort expiry. If API doesn't return expires_in, assume 30 minutes.
  const expiresInSec =
    typeof json?.expires_in === "number" && Number.isFinite(json.expires_in)
      ? json.expires_in
      : 30 * 60;

  cachedToken = { token, expiresAtMs: Date.now() + expiresInSec * 1000 };
  return token;
}

export async function airwallexFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = getAirwallexBaseUrl();
  const token = await getAirwallexAccessToken();

  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || json?.error?.message || `Airwallex API error (${res.status})`);
  }
  return json as T;
}

export function newRequestId(): string {
  return crypto.randomUUID();
}

export async function airwallexCreatePrice(params: {
  productId: string;
  currency: "SGD";
  flatAmount: number;
}): Promise<{ id: string } & Record<string, unknown>> {
  return airwallexFetch("/api/v1/prices/create", {
    method: "POST",
    body: JSON.stringify({
      request_id: newRequestId(),
      product_id: params.productId,
      currency: params.currency,
      pricing_model: "FLAT",
      flat_amount: params.flatAmount,
      recurring: { period: 1, period_unit: "MONTH" },
    }),
  });
}

export async function airwallexCreateBillingCheckoutSubscription(params: {
  priceId: string;
  quantity?: number;
  successUrl: string;
  backUrl: string;
  /**
   * Optional: end of trial period.
   * If provided, Airwallex Billing Checkout expects format like: YYYY-MM-DDTHH:mm:ssZZ (e.g. 2026-03-10T10:00:00+0000)
   */
  trialEndsAt?: string;
  metadata?: Record<string, string>;
}): Promise<{ id: string; url: string; subscription_id?: string } & Record<string, unknown>> {
  const legalEntityId = requiredEnv("AIRWALLEX_LEGAL_ENTITY_ID");
  const linkedPaymentAccountId = requiredEnv("AIRWALLEX_LINKED_PAYMENT_ACCOUNT_ID");

  return airwallexFetch("/api/v1/billing_checkouts/create", {
    method: "POST",
    body: JSON.stringify({
      request_id: newRequestId(),
      mode: "SUBSCRIPTION",
      legal_entity_id: legalEntityId,
      linked_payment_account_id: linkedPaymentAccountId,
      success_url: params.successUrl,
      back_url: params.backUrl,
      line_items: [{ price_id: params.priceId, quantity: params.quantity ?? 1 }],
      metadata: params.metadata || {},
      subscription_data: {
        ...(params.trialEndsAt ? { trial_ends_at: params.trialEndsAt } : {}),
        default_tax_percent: 0,
        days_until_due: 0,
        default_invoice_template: { invoice_memo: "Nexius Labs subscription" },
      },
    }),
  });
}

export function verifyAirwallexWebhookSignature(params: {
  secret: string;
  timestamp: string;
  signature: string;
  rawBody: string;
}): boolean {
  const valueToDigest = `${params.timestamp}${params.rawBody}`;
  const expected = crypto
    .createHmac("sha256", params.secret)
    .update(valueToDigest, "utf8")
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(params.signature, "utf8"));
}
