export interface Role {
  id: string;
  title: string;
  description: string;
  tags: string[];
  kpi: string;
  department: Department;
}

export type Department = "CRM" | "ERP" | "Finance" | "HRMS";

export const departmentColors: Record<Department, { bg: string; text: string; accent: string; light: string }> = {
  CRM: { bg: "bg-blue-600", text: "text-blue-600", accent: "#2563eb", light: "bg-blue-50" },
  ERP: { bg: "bg-emerald-600", text: "text-emerald-600", accent: "#059669", light: "bg-emerald-50" },
  Finance: { bg: "bg-amber-600", text: "text-amber-600", accent: "#d97706", light: "bg-amber-50" },
  HRMS: { bg: "bg-purple-600", text: "text-purple-600", accent: "#9333ea", light: "bg-purple-50" },
};

export const departmentBanners: Record<Department, string> = {
  CRM: "/images/banner-crm.jpg",
  ERP: "/images/banner-erp.jpg",
  Finance: "/images/banner-finance.jpg",
  HRMS: "/images/banner-hrms.jpg",
};

export const roles: Role[] = [
  // CRM
  {
    id: "lead-capture",
    title: "Lead Capture Agent",
    description: "Ingests leads from forms, ads, and referrals into your CRM",
    tags: ["lead generation", "forms", "ads"],
    kpi: "Lead Response Time < 5 min",
    department: "CRM",
  },
  {
    id: "lead-routing",
    title: "Lead Routing Agent",
    description: "Assigns leads to reps based on territory, capacity, fit scoring",
    tags: ["lead assignment", "routing", "sales"],
    kpi: "Lead-to-Contact Rate",
    department: "CRM",
  },
  {
    id: "lifecycle-manager",
    title: "Lifecycle Manager",
    description: "Moves deals through pipeline stages with automated follow-ups",
    tags: ["pipeline", "deal management", "follow-up"],
    kpi: "Pipeline Velocity",
    department: "CRM",
  },
  {
    id: "engagement-ops",
    title: "Engagement Ops Agent",
    description: "Tracks touchpoints across channels, scores engagement levels",
    tags: ["engagement", "scoring", "analytics"],
    kpi: "Engagement Score Accuracy",
    department: "CRM",
  },
  // ERP
  {
    id: "order-to-cash",
    title: "Order-to-Cash Agent",
    description: "Processes orders from quote creation to payment collection",
    tags: ["orders", "invoicing", "payments"],
    kpi: "Order Cycle Time",
    department: "ERP",
  },
  {
    id: "procurement",
    title: "Procurement Agent",
    description: "Manages purchase requests, vendor selection, PO issuance",
    tags: ["purchasing", "vendor management", "PO"],
    kpi: "Procurement Cycle Time",
    department: "ERP",
  },
  {
    id: "inventory",
    title: "Inventory Agent",
    description: "Monitors stock levels in real-time, triggers automated reorders",
    tags: ["inventory", "stock", "warehouse"],
    kpi: "Stockout Rate < 2%",
    department: "ERP",
  },
  {
    id: "dispatch",
    title: "Dispatch Agent",
    description: "Coordinates shipping schedules, carrier selection, tracking",
    tags: ["shipping", "logistics", "delivery"],
    kpi: "On-Time Delivery Rate",
    department: "ERP",
  },
  // Finance
  {
    id: "ar-ap",
    title: "AR/AP Agent",
    description: "Manages accounts receivable and payable end-to-end",
    tags: ["accounts receivable", "accounts payable", "collections"],
    kpi: "DSO Reduction",
    department: "Finance",
  },
  {
    id: "reconciliation",
    title: "Reconciliation Agent",
    description: "Matches bank transactions to ledger entries daily",
    tags: ["bank reconciliation", "ledger", "audit"],
    kpi: "Reconciliation Accuracy > 99%",
    department: "Finance",
  },
  {
    id: "invoicing",
    title: "Invoicing Agent",
    description: "Generates, sends, tracks invoices from creation through payment",
    tags: ["invoicing", "billing", "payment tracking"],
    kpi: "Invoice Processing Time",
    department: "Finance",
  },
  {
    id: "profitability",
    title: "Profitability Agent",
    description: "Calculates margins by product, client, channel",
    tags: ["profitability", "margins", "analytics"],
    kpi: "Margin Visibility Coverage",
    department: "Finance",
  },
  // HRMS
  {
    id: "hiring",
    title: "Hiring Agent",
    description: "Screens applications, schedules interviews, manages pipeline",
    tags: ["recruitment", "hiring", "screening"],
    kpi: "Time-to-Hire",
    department: "HRMS",
  },
  {
    id: "onboarding",
    title: "Onboarding Agent",
    description: "Coordinates equipment provisioning, system access, training",
    tags: ["onboarding", "new hire", "training"],
    kpi: "Onboarding Completion Rate",
    department: "HRMS",
  },
  {
    id: "attendance-leave",
    title: "Attendance & Leave Agent",
    description: "Tracks daily attendance, manages leave requests and approvals",
    tags: ["attendance", "leave management", "time tracking"],
    kpi: "Leave Processing Time < 1hr",
    department: "HRMS",
  },
  {
    id: "payroll-inputs",
    title: "Payroll Inputs Agent",
    description: "Compiles hours, overtime, deductions, allowances",
    tags: ["payroll", "compensation", "deductions"],
    kpi: "Payroll Accuracy > 99.5%",
    department: "HRMS",
  },
];

export const departments: Department[] = ["CRM", "ERP", "Finance", "HRMS"];

export function filterRoles(query: string, department: string): Role[] {
  return roles.filter((role) => {
    const matchesDept = department === "All" || role.department === department;
    if (!query) return matchesDept;
    const q = query.toLowerCase();
    const matchesQuery =
      role.title.toLowerCase().includes(q) ||
      role.description.toLowerCase().includes(q) ||
      role.tags.some((t) => t.toLowerCase().includes(q)) ||
      role.department.toLowerCase().includes(q);
    return matchesDept && matchesQuery;
  });
}
