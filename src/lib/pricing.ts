import type { Complexity, Governance, Role, Workflow } from "@/data/roles";

type PricingConfig = {
  monthlySgd: number;
  setupSgd: number;
};

const workflowBase: Record<Workflow, number> = {
  CRM: 150,
  Finance: 170,
  ERP: 190,
  HRMS: 160,
};

const complexityUplift: Record<Complexity, number> = {
  Starter: 0,
  Intermediate: 25,
  Advanced: 50,
};

const governanceUplift: Record<Governance, number> = {
  Auto: 0,
  "Exception-only": 5,
  "Approval Required": 10,
};

function clampRange(value: number, min = 150, max = 250): number {
  return Math.max(min, Math.min(max, value));
}

export function getRolePricing(role: Pick<Role, "workflow" | "complexity" | "governance">): PricingConfig {
  const rawMonthly =
    workflowBase[role.workflow] +
    complexityUplift[role.complexity] +
    governanceUplift[role.governance];

  const monthlySgd = clampRange(rawMonthly);
  const setupSgd = 0;
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
  }): string {
  const base = process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_URL || "/#contact";
  const isAbsolute = /^https?:\/\//i.test(base);
  if (!isAbsolute) return base;

  const url = new URL(base);
  url.searchParams.set("roles", payload.roleIds.join(","));
  url.searchParams.set("currency", "SGD");
  url.searchParams.set("monthly", String(payload.totalMonthlySgd));
  return url.toString();
}

