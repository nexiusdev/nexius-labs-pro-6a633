import type { Complexity, Governance, Role, Workflow } from "@/data/roles";

type PricingConfig = {
  monthlySgd: number;
  setupSgd: number;
};

const workflowBase: Record<Workflow, number> = {
  CRM: 890,
  Finance: 1090,
  ERP: 1290,
  HRMS: 990,
};

const complexityMultiplier: Record<Complexity, number> = {
  Starter: 1,
  Intermediate: 1.35,
  Advanced: 1.85,
};

const governanceUplift: Record<Governance, number> = {
  Auto: 0,
  "Exception-only": 120,
  "Approval Required": 220,
};

function roundTo9(value: number): number {
  const rounded = Math.round(value / 10) * 10;
  return Math.max(99, rounded - 1);
}

export function getRolePricing(role: Pick<Role, "workflow" | "complexity" | "governance">): PricingConfig {
  const base = workflowBase[role.workflow] * complexityMultiplier[role.complexity] + governanceUplift[role.governance];
  const monthlySgd = roundTo9(base);
  const setupSgd = roundTo9(monthlySgd * 0.7);
  return { monthlySgd, setupSgd };
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
  totalSetupSgd: number;
}): string {
  const base = process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_URL || "/#contact";
  const isAbsolute = /^https?:\/\//i.test(base);
  if (!isAbsolute) return base;

  const url = new URL(base);
  url.searchParams.set("roles", payload.roleIds.join(","));
  url.searchParams.set("currency", "SGD");
  url.searchParams.set("monthly", String(payload.totalMonthlySgd));
  url.searchParams.set("setup", String(payload.totalSetupSgd));
  return url.toString();
}
