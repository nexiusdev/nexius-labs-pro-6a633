import type { Role } from "@/data/roles";

type PricingBucket = "A" | "B" | "C";

type PricingConfig = {
  bucket: PricingBucket;
  monthlySgd: number;
  setupSgd: number;
};

const BUCKET_PRICING: Record<PricingBucket, number> = {
  A: 99,
  B: 199,
  C: 399,
};

const BUCKET_C_KEYWORDS = [
  "legal",
  "compliance",
  "treasury",
  "strategy",
  "planning lead",
  "profitability",
  "commercial finance",
  "financial reporting",
  "payroll",
  "platform lead",
  "workforce planning",
  "product costing",
  "production planning",
] as const;

const BUCKET_A_KEYWORDS = [
  "data entry",
  "steward",
  "coordinator",
  "onboarding specialist",
  "leave & attendance",
  "lead qualification",
  "assistant",
] as const;

function resolvePricingBucket(role: Pick<Role, "title">): PricingBucket {
  const title = role.title.toLowerCase();

  if (BUCKET_C_KEYWORDS.some((kw) => title.includes(kw))) {
    return "C";
  }

  if (BUCKET_A_KEYWORDS.some((kw) => title.includes(kw))) {
    return "A";
  }

  return "B";
}

export function getRolePricing(role: Pick<Role, "title">): PricingConfig {
  const bucket = resolvePricingBucket(role);
  return {
    bucket,
    monthlySgd: BUCKET_PRICING[bucket],
    setupSgd: 0,
  };
}

export function formatSgd(amount: number): string {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function buildPaymentLink(payload: {
  roleIds: string[];
  totalMonthlySgd: number;
}): string {
  const base = process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_URL || "/payment";

  if (/^https?:\/\//i.test(base)) {
    const url = new URL(base);
    url.searchParams.set("roles", payload.roleIds.join(","));
    url.searchParams.set("currency", "SGD");
    url.searchParams.set("monthly", String(payload.totalMonthlySgd));
    return url.toString();
  }

  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}roles=${encodeURIComponent(payload.roleIds.join(","))}&currency=SGD&monthly=${payload.totalMonthlySgd}`;
}
