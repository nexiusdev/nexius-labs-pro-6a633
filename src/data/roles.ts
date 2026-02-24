export interface Role {
  id: string;
  title: string;
  description: string;
  tags: string[];
  kpi: string;
  department: Department;
  functionCount: number;
}

export type Department = "CRM" | "ERP" | "Finance" | "HRMS" | "Operations";

export const departmentColors: Record<Department, { bg: string; text: string; accent: string; light: string; border: string }> = {
  Finance: { bg: "bg-amber-600", text: "text-amber-700", accent: "#d97706", light: "bg-amber-50", border: "border-amber-500" },
  CRM: { bg: "bg-blue-600", text: "text-blue-700", accent: "#2563eb", light: "bg-blue-50", border: "border-blue-500" },
  ERP: { bg: "bg-emerald-600", text: "text-emerald-700", accent: "#059669", light: "bg-emerald-50", border: "border-emerald-500" },
  HRMS: { bg: "bg-purple-600", text: "text-purple-700", accent: "#9333ea", light: "bg-purple-50", border: "border-purple-500" },
  Operations: { bg: "bg-rose-600", text: "text-rose-700", accent: "#e11d48", light: "bg-rose-50", border: "border-rose-500" },
};

export const departmentBanners: Record<Department, string> = {
  CRM: "/images/banner-crm.jpg",
  ERP: "/images/banner-erp.jpg",
  Finance: "/images/banner-finance.jpg",
  HRMS: "/images/banner-hrms.jpg",
  Operations: "/images/banner-erp.jpg",
};

export const roles: Role[] = [
  // Finance
  {
    id: "accounts-payable-specialist",
    title: "Accounts Payable Specialist",
    description: "Automates invoice processing, payments, and reconciliation.",
    tags: ["Purchase-to-Pay", "Month-End Close", "Vendor Management"],
    kpi: "Invoice Processing Time",
    department: "Finance",
    functionCount: 3,
  },
  {
    id: "accounts-receivable-manager",
    title: "Accounts Receivable Manager",
    description: "Manages invoicing, collections, and cash application.",
    tags: ["Order-to-Cash", "Collections", "Revenue Recognition"],
    kpi: "DSO Reduction",
    department: "Finance",
    functionCount: 3,
  },
  {
    id: "financial-reporting-analyst",
    title: "Financial Reporting Analyst",
    description: "Automates financial reporting and compliance.",
    tags: ["Month-End Reporting", "Quarterly Close", "Regulatory Filing"],
    kpi: "Report Accuracy > 99%",
    department: "Finance",
    functionCount: 3,
  },
  {
    id: "expense-management-coordinator",
    title: "Expense Management Coordinator",
    description: "Automates expense processing and compliance.",
    tags: ["Expense-to-Reimburse", "Budget Monitoring", "Audit Preparation"],
    kpi: "Expense Processing Time",
    department: "Finance",
    functionCount: 3,
  },
  // CRM
  {
    id: "sales-operations-coordinator",
    title: "Sales Operations Coordinator",
    description: "Streamlines sales pipeline and CRM operations.",
    tags: ["Lead-to-Opportunity", "Quote-to-Close", "Sales Forecasting"],
    kpi: "Pipeline Velocity",
    department: "CRM",
    functionCount: 3,
  },
  {
    id: "customer-success-associate",
    title: "Customer Success Associate",
    description: "Monitors customer health and drives retention.",
    tags: ["Customer Onboarding", "Renewal Pipeline", "Churn Prevention"],
    kpi: "Net Revenue Retention",
    department: "CRM",
    functionCount: 3,
  },
  {
    id: "lead-qualification-specialist",
    title: "Lead Qualification Specialist",
    description: "Scores, qualifies, and routes inbound leads.",
    tags: ["Lead Capture", "MQL-to-SQL", "Lead Nurturing"],
    kpi: "Lead Response Time < 5 min",
    department: "CRM",
    functionCount: 3,
  },
  {
    id: "crm-data-steward",
    title: "CRM Data Steward",
    description: "Maintains CRM data quality and enrichment.",
    tags: ["Data Quality", "Master Data Management", "CRM Hygiene"],
    kpi: "Data Accuracy Rate",
    department: "CRM",
    functionCount: 3,
  },
  // ERP
  {
    id: "procurement-analyst",
    title: "Procurement Analyst",
    description: "Automates procurement and vendor management.",
    tags: ["Procure-to-Pay", "Vendor Onboarding", "Contract Lifecycle"],
    kpi: "Procurement Cycle Time",
    department: "ERP",
    functionCount: 3,
  },
  {
    id: "inventory-controller",
    title: "Inventory Controller",
    description: "Optimizes inventory levels and warehouse operations.",
    tags: ["Inventory Replenishment", "Warehouse Operations", "Demand Planning"],
    kpi: "Stockout Rate < 2%",
    department: "ERP",
    functionCount: 3,
  },
  {
    id: "order-management-specialist",
    title: "Order Management Specialist",
    description: "Manages order lifecycle from capture to fulfillment.",
    tags: ["Order-to-Fulfillment", "Returns Processing", "Backorder Management"],
    kpi: "Order Cycle Time",
    department: "ERP",
    functionCount: 3,
  },
  {
    id: "production-planning-analyst",
    title: "Production Planning Analyst",
    description: "Optimizes production scheduling and MRP.",
    tags: ["Plan-to-Produce", "Material Planning", "Capacity Management"],
    kpi: "Production Schedule Adherence",
    department: "ERP",
    functionCount: 3,
  },
  // HRMS
  {
    id: "payroll-administrator",
    title: "Payroll Administrator",
    description: "Processes payroll, tax, and benefits administration.",
    tags: ["Monthly Payroll", "Tax Filing", "Benefits Enrollment"],
    kpi: "Payroll Accuracy > 99.5%",
    department: "HRMS",
    functionCount: 3,
  },
  {
    id: "recruitment-coordinator",
    title: "Recruitment Coordinator",
    description: "Automates recruitment lifecycle and candidate management.",
    tags: ["Hire-to-Onboard", "Talent Pipeline", "Campus Recruitment"],
    kpi: "Time-to-Hire",
    department: "HRMS",
    functionCount: 3,
  },
  {
    id: "employee-onboarding-specialist",
    title: "Employee Onboarding Specialist",
    description: "Orchestrates new hire onboarding end-to-end.",
    tags: ["Offer-to-Onboard", "Training Program", "Compliance Checklist"],
    kpi: "Onboarding Completion Rate",
    department: "HRMS",
    functionCount: 3,
  },
  {
    id: "leave-attendance-manager",
    title: "Leave & Attendance Manager",
    description: "Manages time tracking, leave, and attendance.",
    tags: ["Time-to-Pay", "Leave Processing", "Attendance Compliance"],
    kpi: "Leave Processing Time < 1hr",
    department: "HRMS",
    functionCount: 3,
  },
  // Operations
  {
    id: "supply-chain-coordinator",
    title: "Supply Chain Coordinator",
    description: "Coordinates supply chain and logistics operations.",
    tags: ["Plan-to-Deliver", "Supplier Management", "Logistics Optimization"],
    kpi: "On-Time Delivery Rate",
    department: "Operations",
    functionCount: 3,
  },
  {
    id: "quality-assurance-monitor",
    title: "Quality Assurance Monitor",
    description: "Monitors quality and automates inspection workflows.",
    tags: ["Quality Control", "Audit Management", "Continuous Improvement"],
    kpi: "Defect Rate Reduction",
    department: "Operations",
    functionCount: 3,
  },
  {
    id: "data-entry-processor",
    title: "Data Entry Processor",
    description: "Automates high-volume data processing and validation.",
    tags: ["Document-to-Data", "Data Migration", "Record Maintenance"],
    kpi: "Processing Accuracy > 99%",
    department: "Operations",
    functionCount: 3,
  },
  {
    id: "compliance-officer",
    title: "Compliance Officer",
    description: "Monitors compliance and maintains audit readiness.",
    tags: ["Compliance Monitoring", "Audit Preparation", "Risk Assessment"],
    kpi: "Compliance Score",
    department: "Operations",
    functionCount: 3,
  },
];

export const departments: Department[] = ["Finance", "CRM", "ERP", "HRMS", "Operations"];

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
