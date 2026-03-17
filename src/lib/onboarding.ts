const TELEGRAM_USER_ID_RE = /^\d{3,20}$/;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

export function validateTelegramUserId(value: string) {
  return TELEGRAM_USER_ID_RE.test(value.trim());
}

export function buildCustomerId(fullName: string, subscriptionId: string) {
  const base = slugify(fullName) || "customer";
  const suffix = subscriptionId.replace(/-/g, "").slice(0, 8).toLowerCase();
  return `${base}-${suffix}`;
}

// Idempotency key used for Nexius Control onboarding calls.
// Nexius Control expects a customer-scoped key like: onboard-<customerId>
export function buildOnboardingIdempotencyKey(customerId: string) {
  return `onboard-${customerId}`;
}

export function buildOnboardingRequestId() {
  return `req_${crypto.randomUUID().replace(/-/g, "")}`;
}
