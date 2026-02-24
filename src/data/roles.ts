export interface RoleFunction {
  name: string;
  automationPercent: number;
  skills: string[];
}

export interface RoleOutcome {
  value: string;
  label: string;
  description: string;
}

export type Governance = "Auto" | "Approval Required" | "Exception-only";
export type Complexity = "Starter" | "Intermediate" | "Advanced";
export type TimeToValue = "<2 weeks" | "2-4 weeks" | "1-2 months";
export type OutcomeCategory = "Speed" | "Reliability" | "Cashflow" | "Control";
export type System = "ATS" | "CRM" | "ERP" | "Finance" | "HRMS" | "ITSM" | "MAP" | "WMS";

export interface Role {
  id: string;
  title: string;
  description: string;
  detailedDescription: string;
  tags: string[];
  kpi: string;
  department: Department;
  functionCount: number;
  functions: RoleFunction[];
  outcomes: RoleOutcome[];
  governance: Governance;
  complexity: Complexity;
  timeToValue: TimeToValue;
  outcomeCategory: OutcomeCategory;
  systems: System[];
  image: string;
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
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    description: "Automates invoice processing, payments, and reconciliation.",
    detailedDescription: "Handles the full accounts payable lifecycle from invoice receipt through payment execution. Automates three-way matching, manages approval workflows, and ensures timely vendor payments while maintaining accurate records for month-end close.",
    tags: ["Purchase-to-Pay", "Month-End Close", "Vendor Management"],
    kpi: "Invoice Processing Time",
    department: "Finance",
    functionCount: 3,
    functions: [
      { name: "Invoice Processing", automationPercent: 92, skills: ["Three-way matching", "OCR extraction", "Approval routing"] },
      { name: "Payment Execution", automationPercent: 88, skills: ["Payment scheduling", "Batch processing", "Bank reconciliation"] },
      { name: "Vendor Management", automationPercent: 85, skills: ["Vendor onboarding", "W-9 tracking", "Payment terms"] },
    ],
    outcomes: [
      { value: "92%", label: "Auto-Match Rate", description: "Invoice-to-PO matching accuracy" },
      { value: "3x faster", label: "Processing Speed", description: "Invoice processing acceleration" },
      { value: "99.5%", label: "Payment Accuracy", description: "Error-free payment execution" },
    ],
    governance: "Approval Required",
    complexity: "Intermediate",
    timeToValue: "2-4 weeks",
    outcomeCategory: "Control",
    systems: ["ERP", "Finance"],
  },
  {
    id: "accounts-receivable-manager",
    title: "Accounts Receivable Manager",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    description: "Manages invoicing, collections, and cash application.",
    detailedDescription: "Oversees the entire order-to-cash cycle including invoice generation, payment tracking, collections management, and cash application. Reduces Days Sales Outstanding through automated follow-ups and intelligent escalation workflows.",
    tags: ["Order-to-Cash", "Collections", "Revenue Recognition"],
    kpi: "DSO Reduction",
    department: "Finance",
    functionCount: 3,
    functions: [
      { name: "Collections Management", automationPercent: 90, skills: ["Aging analysis", "Automated reminders", "Escalation rules"] },
      { name: "Cash Application", automationPercent: 88, skills: ["Payment matching", "Remittance processing", "Exception handling"] },
      { name: "Revenue Recognition", automationPercent: 85, skills: ["Revenue scheduling", "Compliance checks", "Period close"] },
    ],
    outcomes: [
      { value: "35%", label: "DSO Reduction", description: "Days Sales Outstanding improvement" },
      { value: "90%", label: "Auto-Match Rate", description: "Payment-to-invoice matching" },
      { value: "2x faster", label: "Collections Cycle", description: "Faster outstanding recovery" },
    ],
    governance: "Approval Required",
    complexity: "Intermediate",
    timeToValue: "2-4 weeks",
    outcomeCategory: "Cashflow",
    systems: ["ERP", "Finance", "CRM"],
  },
  {
    id: "financial-reporting-analyst",
    title: "Financial Reporting Analyst",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    description: "Automates financial reporting and compliance.",
    detailedDescription: "Automates the preparation of financial statements, management reports, and regulatory filings. Ensures accuracy through automated reconciliation and validation checks while maintaining compliance with accounting standards.",
    tags: ["Month-End Reporting", "Quarterly Close", "Regulatory Filing"],
    kpi: "Report Accuracy > 99%",
    department: "Finance",
    functionCount: 3,
    functions: [
      { name: "Financial Reporting", automationPercent: 91, skills: ["P&L generation", "Balance sheet prep", "Variance analysis"] },
      { name: "Close Management", automationPercent: 87, skills: ["Task tracking", "Checklist automation", "Intercompany elimination"] },
      { name: "Regulatory Filing", automationPercent: 83, skills: ["Tax preparation", "Compliance validation", "Audit support"] },
    ],
    outcomes: [
      { value: "99.2%", label: "Report Accuracy", description: "Financial statement precision" },
      { value: "50% faster", label: "Close Cycle", description: "Month-end close acceleration" },
      { value: "100%", label: "Filing Compliance", description: "On-time regulatory submissions" },
    ],
    governance: "Approval Required",
    complexity: "Advanced",
    timeToValue: "1-2 months",
    outcomeCategory: "Reliability",
    systems: ["ERP", "Finance"],
  },
  {
    id: "expense-management-coordinator",
    title: "Expense Management Coordinator",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    description: "Automates expense processing and compliance.",
    detailedDescription: "Manages the full expense lifecycle from submission through reimbursement. Enforces spending policies, automates approvals, monitors budgets in real-time, and prepares audit-ready documentation.",
    tags: ["Expense-to-Reimburse", "Budget Monitoring", "Audit Preparation"],
    kpi: "Expense Processing Time",
    department: "Finance",
    functionCount: 3,
    functions: [
      { name: "Expense Processing", automationPercent: 93, skills: ["Receipt OCR", "Policy validation", "Auto-categorization"] },
      { name: "Budget Monitoring", automationPercent: 86, skills: ["Spend tracking", "Threshold alerts", "Forecast modeling"] },
      { name: "Audit Preparation", automationPercent: 84, skills: ["Documentation assembly", "Compliance checks", "Trail generation"] },
    ],
    outcomes: [
      { value: "80%", label: "Faster Processing", description: "Expense-to-reimburse cycle time" },
      { value: "95%", label: "Policy Compliance", description: "Auto-enforced spending rules" },
      { value: "Zero", label: "Audit Findings", description: "Clean audit documentation" },
    ],
    governance: "Exception-only",
    complexity: "Starter",
    timeToValue: "<2 weeks",
    outcomeCategory: "Speed",
    systems: ["ERP", "Finance"],
  },
  // CRM
  {
    id: "sales-operations-coordinator",
    title: "Sales Operations Coordinator",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    description: "Streamlines sales pipeline and CRM operations.",
    detailedDescription: "Streamlines the entire sales pipeline from lead capture to deal closure. Manages CRM data hygiene, sales forecasting, and pipeline analytics to maximize conversion rates and revenue predictability.",
    tags: ["Lead-to-Opportunity", "Quote-to-Close", "Sales Forecasting"],
    kpi: "Pipeline Velocity",
    department: "CRM",
    functionCount: 3,
    functions: [
      { name: "Pipeline Management", automationPercent: 90, skills: ["Lead scoring", "Stage progression", "Deal tracking"] },
      { name: "CRM Data Management", automationPercent: 92, skills: ["Deduplication", "Enrichment", "Field validation"] },
      { name: "Sales Reporting", automationPercent: 88, skills: ["Forecast modeling", "Win/loss analysis", "Activity metrics"] },
    ],
    outcomes: [
      { value: "99%", label: "Data Accuracy", description: "CRM data quality score" },
      { value: "35% faster", label: "Pipeline Velocity", description: "Deal cycle acceleration" },
      { value: "92%", label: "Forecast Accuracy", description: "Revenue prediction precision" },
    ],
    governance: "Exception-only",
    complexity: "Intermediate",
    timeToValue: "2-4 weeks",
    outcomeCategory: "Speed",
    systems: ["CRM"],
  },
  {
    id: "customer-success-associate",
    title: "Customer Success Associate",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    description: "Monitors customer health and drives retention.",
    detailedDescription: "Proactively monitors customer health scores, identifies churn risks, and orchestrates retention workflows. Manages the full customer lifecycle from onboarding through renewal, ensuring high satisfaction and net revenue retention.",
    tags: ["Customer Onboarding", "Renewal Pipeline", "Churn Prevention"],
    kpi: "Net Revenue Retention",
    department: "CRM",
    functionCount: 3,
    functions: [
      { name: "Health Monitoring", automationPercent: 91, skills: ["Usage analytics", "Sentiment tracking", "Risk scoring"] },
      { name: "Onboarding Orchestration", automationPercent: 89, skills: ["Welcome sequences", "Milestone tracking", "Training delivery"] },
      { name: "Renewal Management", automationPercent: 87, skills: ["Renewal forecasting", "Expansion identification", "Contract generation"] },
    ],
    outcomes: [
      { value: "95%", label: "Retention Rate", description: "Customer renewal success" },
      { value: "40%", label: "Churn Reduction", description: "At-risk customer recovery" },
      { value: "120%", label: "Net Revenue Retention", description: "Including expansion revenue" },
    ],
    governance: "Auto",
    complexity: "Starter",
    timeToValue: "<2 weeks",
    outcomeCategory: "Reliability",
    systems: ["CRM"],
  },
  {
    id: "lead-qualification-specialist",
    title: "Lead Qualification Specialist",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    description: "Scores, qualifies, and routes inbound leads.",
    detailedDescription: "Automates the lead qualification process from initial capture through sales handoff. Uses multi-factor scoring to prioritize leads, nurtures prospects through automated sequences, and routes qualified leads to the right sales representatives.",
    tags: ["Lead Capture", "MQL-to-SQL", "Lead Nurturing"],
    kpi: "Lead Response Time < 5 min",
    department: "CRM",
    functionCount: 3,
    functions: [
      { name: "Lead Scoring", automationPercent: 94, skills: ["Behavioral scoring", "Firmographic analysis", "Intent signals"] },
      { name: "Lead Nurturing", automationPercent: 90, skills: ["Email sequences", "Content delivery", "Engagement tracking"] },
      { name: "Lead Routing", automationPercent: 92, skills: ["Territory mapping", "Capacity balancing", "Round-robin assignment"] },
    ],
    outcomes: [
      { value: "<5 min", label: "Response Time", description: "Average lead response speed" },
      { value: "3x", label: "Conversion Rate", description: "MQL-to-SQL improvement" },
      { value: "85%", label: "Routing Accuracy", description: "Correct rep assignment rate" },
    ],
    governance: "Auto",
    complexity: "Starter",
    timeToValue: "<2 weeks",
    outcomeCategory: "Speed",
    systems: ["CRM", "MAP"],
  },
  {
    id: "crm-data-steward",
    title: "CRM Data Steward",
    image: "https://images.unsplash.com/photo-1573495627361-d9b87960b12d?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    description: "Maintains CRM data quality and enrichment.",
    detailedDescription: "Ensures the integrity, accuracy, and completeness of CRM data across all objects. Automates deduplication, enrichment from third-party sources, and ongoing hygiene workflows to maintain a trusted data foundation for sales and marketing.",
    tags: ["Data Quality", "Master Data Management", "CRM Hygiene"],
    kpi: "Data Accuracy Rate",
    department: "CRM",
    functionCount: 3,
    functions: [
      { name: "Data Quality", automationPercent: 93, skills: ["Duplicate detection", "Standardization", "Completeness checks"] },
      { name: "Data Enrichment", automationPercent: 89, skills: ["Third-party matching", "Firmographic fill", "Contact verification"] },
      { name: "Hygiene Automation", automationPercent: 91, skills: ["Decay detection", "Field validation", "Merge management"] },
    ],
    outcomes: [
      { value: "99%", label: "Data Accuracy", description: "Clean record percentage" },
      { value: "75%", label: "Duplicate Reduction", description: "Deduplication effectiveness" },
      { value: "95%", label: "Completeness", description: "Required field fill rate" },
    ],
    governance: "Auto",
    complexity: "Intermediate",
    timeToValue: "2-4 weeks",
    outcomeCategory: "Reliability",
    systems: ["CRM"],
  },
  // ERP
  {
    id: "procurement-analyst",
    title: "Procurement Analyst",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    description: "Automates procurement and vendor management.",
    detailedDescription: "Manages the full procure-to-pay cycle from requisition through payment. Automates vendor selection, purchase order generation, and contract lifecycle management to optimize spending and ensure compliance.",
    tags: ["Procure-to-Pay", "Vendor Onboarding", "Contract Lifecycle"],
    kpi: "Procurement Cycle Time",
    department: "ERP",
    functionCount: 3,
    functions: [
      { name: "Purchase Management", automationPercent: 89, skills: ["Requisition processing", "PO generation", "Approval workflows"] },
      { name: "Vendor Operations", automationPercent: 86, skills: ["Vendor onboarding", "Performance scoring", "Compliance tracking"] },
      { name: "Contract Management", automationPercent: 84, skills: ["Contract creation", "Renewal tracking", "Terms enforcement"] },
    ],
    outcomes: [
      { value: "60%", label: "Cycle Reduction", description: "Procurement process acceleration" },
      { value: "15%", label: "Cost Savings", description: "Negotiation and compliance gains" },
      { value: "99%", label: "PO Accuracy", description: "Error-free purchase orders" },
    ],
    governance: "Approval Required",
    complexity: "Advanced",
    timeToValue: "1-2 months",
    outcomeCategory: "Control",
    systems: ["ERP", "Finance"],
  },
  {
    id: "inventory-controller",
    title: "Inventory Controller",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    description: "Optimizes inventory levels and warehouse operations.",
    detailedDescription: "Monitors inventory levels in real-time, automates reorder processes, and optimizes warehouse operations. Uses demand forecasting to prevent stockouts while minimizing carrying costs across all locations.",
    tags: ["Inventory Replenishment", "Warehouse Operations", "Demand Planning"],
    kpi: "Stockout Rate < 2%",
    department: "ERP",
    functionCount: 3,
    functions: [
      { name: "Inventory Optimization", automationPercent: 91, skills: ["Safety stock calc", "ABC analysis", "Reorder automation"] },
      { name: "Warehouse Operations", automationPercent: 87, skills: ["Pick/pack routing", "Location management", "Cycle counting"] },
      { name: "Demand Planning", automationPercent: 85, skills: ["Forecast modeling", "Seasonal adjustment", "Trend analysis"] },
    ],
    outcomes: [
      { value: "<2%", label: "Stockout Rate", description: "Product availability assurance" },
      { value: "25%", label: "Carrying Cost Reduction", description: "Inventory holding savings" },
      { value: "95%", label: "Forecast Accuracy", description: "Demand prediction precision" },
    ],
    governance: "Exception-only",
    complexity: "Intermediate",
    timeToValue: "2-4 weeks",
    outcomeCategory: "Reliability",
    systems: ["ERP", "WMS"],
  },
  {
    id: "order-management-specialist",
    title: "Order Management Specialist",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    description: "Manages order lifecycle from capture to fulfillment.",
    detailedDescription: "Oversees the complete order lifecycle from initial capture through fulfillment and delivery. Handles returns processing, backorder management, and ensures accurate order tracking for customer satisfaction.",
    tags: ["Order-to-Fulfillment", "Returns Processing", "Backorder Management"],
    kpi: "Order Cycle Time",
    department: "ERP",
    functionCount: 3,
    functions: [
      { name: "Order Processing", automationPercent: 93, skills: ["Order validation", "Fulfillment routing", "Status tracking"] },
      { name: "Returns Management", automationPercent: 88, skills: ["RMA processing", "Refund automation", "Restocking workflows"] },
      { name: "Backorder Resolution", automationPercent: 86, skills: ["Priority queuing", "Substitution logic", "Customer notification"] },
    ],
    outcomes: [
      { value: "95%", label: "On-Time Fulfillment", description: "Order delivery accuracy" },
      { value: "70% faster", label: "Order Processing", description: "Order-to-ship acceleration" },
      { value: "98%", label: "Order Accuracy", description: "Error-free fulfillment rate" },
    ],
    governance: "Exception-only",
    complexity: "Intermediate",
    timeToValue: "2-4 weeks",
    outcomeCategory: "Speed",
    systems: ["ERP", "CRM"],
  },
  {
    id: "production-planning-analyst",
    title: "Production Planning Analyst",
    image: "https://images.unsplash.com/photo-1556157382-97eded2f9b0a?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    description: "Optimizes production scheduling and MRP.",
    detailedDescription: "Optimizes production scheduling, material requirements planning, and capacity management. Ensures efficient resource utilization while meeting delivery commitments through automated planning and scheduling workflows.",
    tags: ["Plan-to-Produce", "Material Planning", "Capacity Management"],
    kpi: "Production Schedule Adherence",
    department: "ERP",
    functionCount: 3,
    functions: [
      { name: "Production Scheduling", automationPercent: 87, skills: ["Schedule optimization", "Resource allocation", "Constraint handling"] },
      { name: "Material Planning", automationPercent: 90, skills: ["BOM explosion", "MRP runs", "Shortage alerts"] },
      { name: "Capacity Management", automationPercent: 84, skills: ["Load balancing", "Bottleneck detection", "What-if analysis"] },
    ],
    outcomes: [
      { value: "95%", label: "Schedule Adherence", description: "On-time production completion" },
      { value: "30%", label: "Setup Reduction", description: "Changeover time optimization" },
      { value: "98%", label: "Material Availability", description: "Right materials at right time" },
    ],
    governance: "Approval Required",
    complexity: "Advanced",
    timeToValue: "1-2 months",
    outcomeCategory: "Reliability",
    systems: ["ERP"],
  },
  // HRMS
  {
    id: "payroll-administrator",
    title: "Payroll Administrator",
    image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    description: "Processes payroll, tax, and benefits administration.",
    detailedDescription: "Manages the complete payroll cycle including salary computation, tax withholding, benefits deductions, and statutory compliance. Ensures accurate and timely payroll processing while maintaining full audit trails.",
    tags: ["Monthly Payroll", "Tax Filing", "Benefits Enrollment"],
    kpi: "Payroll Accuracy > 99.5%",
    department: "HRMS",
    functionCount: 3,
    functions: [
      { name: "Payroll Processing", automationPercent: 94, skills: ["Salary computation", "Deduction management", "Payslip generation"] },
      { name: "Tax Compliance", automationPercent: 90, skills: ["Withholding calculation", "Filing automation", "Year-end reporting"] },
      { name: "Benefits Administration", automationPercent: 88, skills: ["Enrollment processing", "Premium calculation", "Coverage tracking"] },
    ],
    outcomes: [
      { value: "99.5%", label: "Payroll Accuracy", description: "Error-free processing rate" },
      { value: "100%", label: "On-Time Filing", description: "Tax compliance record" },
      { value: "80% faster", label: "Processing Time", description: "Payroll cycle acceleration" },
    ],
    governance: "Approval Required",
    complexity: "Intermediate",
    timeToValue: "2-4 weeks",
    outcomeCategory: "Reliability",
    systems: ["HRMS", "Finance"],
  },
  {
    id: "recruitment-coordinator",
    title: "Recruitment Coordinator",
    image: "https://images.unsplash.com/photo-1559526324-593bc073d938?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    description: "Automates recruitment lifecycle and candidate management.",
    detailedDescription: "Automates the full recruitment lifecycle from job posting through candidate onboarding. Manages applicant tracking, interview scheduling, and talent pipeline nurturing to reduce time-to-hire while improving candidate quality.",
    tags: ["Hire-to-Onboard", "Talent Pipeline", "Campus Recruitment"],
    kpi: "Time-to-Hire",
    department: "HRMS",
    functionCount: 3,
    functions: [
      { name: "Applicant Screening", automationPercent: 91, skills: ["Resume parsing", "Criteria matching", "Ranking algorithms"] },
      { name: "Interview Coordination", automationPercent: 89, skills: ["Calendar sync", "Panel scheduling", "Feedback collection"] },
      { name: "Talent Pipeline", automationPercent: 86, skills: ["Candidate nurturing", "Pool management", "Campus outreach"] },
    ],
    outcomes: [
      { value: "50% faster", label: "Time-to-Hire", description: "Recruitment cycle reduction" },
      { value: "500+", label: "Weekly Screens", description: "Application throughput capacity" },
      { value: "95%", label: "Candidate Satisfaction", description: "Process experience rating" },
    ],
    governance: "Exception-only",
    complexity: "Intermediate",
    timeToValue: "2-4 weeks",
    outcomeCategory: "Speed",
    systems: ["HRMS", "ATS"],
  },
  {
    id: "employee-onboarding-specialist",
    title: "Employee Onboarding Specialist",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    description: "Orchestrates new hire onboarding end-to-end.",
    detailedDescription: "Orchestrates the complete new hire onboarding experience from offer acceptance through first-90-day milestones. Coordinates equipment provisioning, system access, compliance training, and team introductions.",
    tags: ["Offer-to-Onboard", "Training Program", "Compliance Checklist"],
    kpi: "Onboarding Completion Rate",
    department: "HRMS",
    functionCount: 3,
    functions: [
      { name: "Onboarding Orchestration", automationPercent: 92, skills: ["Task sequencing", "Document collection", "Checklist tracking"] },
      { name: "Training Program", automationPercent: 88, skills: ["Course assignment", "Progress tracking", "Certification management"] },
      { name: "Compliance Management", automationPercent: 90, skills: ["Policy acknowledgment", "Background verification", "Mandatory training"] },
    ],
    outcomes: [
      { value: "100%", label: "Completion Rate", description: "Full onboarding checklist coverage" },
      { value: "3 days", label: "Time to Productive", description: "New hire ramp acceleration" },
      { value: "98%", label: "Compliance Score", description: "Mandatory training completion" },
    ],
    governance: "Auto",
    complexity: "Starter",
    timeToValue: "<2 weeks",
    outcomeCategory: "Speed",
    systems: ["HRMS"],
  },
  {
    id: "leave-attendance-manager",
    title: "Leave & Attendance Manager",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    description: "Manages time tracking, leave, and attendance.",
    detailedDescription: "Manages employee time tracking, leave requests, and attendance compliance. Automates policy enforcement, overtime calculations, and absence tracking to ensure accurate payroll inputs and workforce availability.",
    tags: ["Time-to-Pay", "Leave Processing", "Attendance Compliance"],
    kpi: "Leave Processing Time < 1hr",
    department: "HRMS",
    functionCount: 3,
    functions: [
      { name: "Leave Processing", automationPercent: 93, skills: ["Request handling", "Balance calculation", "Approval routing"] },
      { name: "Time Tracking", automationPercent: 90, skills: ["Clock management", "Overtime calculation", "Shift scheduling"] },
      { name: "Compliance Monitoring", automationPercent: 87, skills: ["Policy enforcement", "Absence alerts", "Audit reporting"] },
    ],
    outcomes: [
      { value: "<1 hr", label: "Processing Time", description: "Leave request turnaround" },
      { value: "99%", label: "Tracking Accuracy", description: "Time and attendance precision" },
      { value: "100%", label: "Policy Compliance", description: "Automated rule enforcement" },
    ],
    governance: "Auto",
    complexity: "Starter",
    timeToValue: "<2 weeks",
    outcomeCategory: "Speed",
    systems: ["HRMS"],
  },
  // Operations
  {
    id: "supply-chain-coordinator",
    title: "Supply Chain Coordinator",
    image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    description: "Coordinates supply chain and logistics operations.",
    detailedDescription: "Coordinates end-to-end supply chain operations from planning through delivery. Manages supplier relationships, optimizes logistics routes, and ensures timely delivery while minimizing transportation costs.",
    tags: ["Plan-to-Deliver", "Supplier Management", "Logistics Optimization"],
    kpi: "On-Time Delivery Rate",
    department: "Operations",
    functionCount: 3,
    functions: [
      { name: "Supply Planning", automationPercent: 88, skills: ["Demand aggregation", "Supply scheduling", "Risk monitoring"] },
      { name: "Supplier Management", automationPercent: 86, skills: ["Performance tracking", "Scorecard automation", "Issue escalation"] },
      { name: "Logistics Optimization", automationPercent: 84, skills: ["Route planning", "Carrier selection", "Shipment tracking"] },
    ],
    outcomes: [
      { value: "97%", label: "On-Time Delivery", description: "Shipment delivery accuracy" },
      { value: "20%", label: "Cost Reduction", description: "Logistics spend optimization" },
      { value: "99%", label: "Visibility", description: "End-to-end supply chain tracking" },
    ],
    governance: "Approval Required",
    complexity: "Advanced",
    timeToValue: "1-2 months",
    outcomeCategory: "Speed",
    systems: ["ERP", "WMS"],
  },
  {
    id: "quality-assurance-monitor",
    title: "Quality Assurance Monitor",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    description: "Monitors quality and automates inspection workflows.",
    detailedDescription: "Monitors quality metrics across operations and automates inspection workflows. Manages audit schedules, tracks non-conformances, and drives continuous improvement initiatives through data-driven insights.",
    tags: ["Quality Control", "Audit Management", "Continuous Improvement"],
    kpi: "Defect Rate Reduction",
    department: "Operations",
    functionCount: 3,
    functions: [
      { name: "Quality Inspection", automationPercent: 89, skills: ["Checklist automation", "Defect logging", "Trend analysis"] },
      { name: "Audit Management", automationPercent: 86, skills: ["Schedule planning", "Finding tracking", "CAPA management"] },
      { name: "Continuous Improvement", automationPercent: 83, skills: ["Root cause analysis", "Process mapping", "KPI dashboards"] },
    ],
    outcomes: [
      { value: "45%", label: "Defect Reduction", description: "Quality improvement rate" },
      { value: "100%", label: "Audit Readiness", description: "Always inspection-ready" },
      { value: "30%", label: "Efficiency Gain", description: "Process improvement impact" },
    ],
    governance: "Exception-only",
    complexity: "Intermediate",
    timeToValue: "2-4 weeks",
    outcomeCategory: "Control",
    systems: ["ERP", "ITSM"],
  },
  {
    id: "data-entry-processor",
    title: "Data Entry Processor",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    description: "Automates high-volume data processing and validation.",
    detailedDescription: "Automates high-volume data processing, validation, and entry across systems. Handles document digitization, data migration, and ongoing record maintenance with enterprise-grade accuracy.",
    tags: ["Document-to-Data", "Data Migration", "Record Maintenance"],
    kpi: "Processing Accuracy > 99%",
    department: "Operations",
    functionCount: 3,
    functions: [
      { name: "Data Processing", automationPercent: 95, skills: ["OCR extraction", "Format standardization", "Batch processing"] },
      { name: "Data Migration", automationPercent: 88, skills: ["Schema mapping", "Transformation rules", "Validation checks"] },
      { name: "Record Maintenance", automationPercent: 91, skills: ["Update workflows", "Archival automation", "Integrity monitoring"] },
    ],
    outcomes: [
      { value: "99.5%", label: "Accuracy Rate", description: "Data entry precision" },
      { value: "10x faster", label: "Processing Speed", description: "vs. manual data entry" },
      { value: "95%", label: "Automation Rate", description: "Touchless processing" },
    ],
    governance: "Auto",
    complexity: "Starter",
    timeToValue: "<2 weeks",
    outcomeCategory: "Speed",
    systems: ["ERP"],
  },
  {
    id: "compliance-officer",
    title: "Compliance Officer",
    image: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    description: "Monitors compliance and maintains audit readiness.",
    detailedDescription: "Monitors regulatory compliance across the organization, maintains audit readiness, and automates risk assessments. Ensures adherence to industry standards and internal policies through continuous monitoring and documentation.",
    tags: ["Compliance Monitoring", "Audit Preparation", "Risk Assessment"],
    kpi: "Compliance Score",
    department: "Operations",
    functionCount: 3,
    functions: [
      { name: "Compliance Monitoring", automationPercent: 90, skills: ["Policy tracking", "Violation detection", "Regulatory updates"] },
      { name: "Audit Preparation", automationPercent: 87, skills: ["Evidence collection", "Documentation assembly", "Gap analysis"] },
      { name: "Risk Assessment", automationPercent: 85, skills: ["Risk scoring", "Control testing", "Mitigation tracking"] },
    ],
    outcomes: [
      { value: "100%", label: "Compliance Score", description: "Full regulatory adherence" },
      { value: "60%", label: "Audit Time Reduction", description: "Preparation efficiency" },
      { value: "Zero", label: "Critical Findings", description: "Clean audit record" },
    ],
    governance: "Approval Required",
    complexity: "Advanced",
    timeToValue: "1-2 months",
    outcomeCategory: "Control",
    systems: ["ERP", "Finance", "ITSM"],
  },
];

export const departments: Department[] = ["Finance", "CRM", "ERP", "HRMS", "Operations"];
export const governanceOptions: Governance[] = ["Auto", "Approval Required", "Exception-only"];
export const complexityOptions: Complexity[] = ["Starter", "Intermediate", "Advanced"];
export const timeToValueOptions: TimeToValue[] = ["<2 weeks", "2-4 weeks", "1-2 months"];
export const outcomeCategoryOptions: OutcomeCategory[] = ["Speed", "Reliability", "Cashflow", "Control"];
export const systemOptions: System[] = ["ATS", "CRM", "ERP", "Finance", "HRMS", "ITSM", "MAP", "WMS"];

export interface FilterState {
  query: string;
  department: string;
  outcomeCategory: string;
  governance: string;
  complexity: string;
  timeToValue: string;
  systems: string[];
  sort: string;
}

export function filterRoles(query: string, department: string): Role[] {
  return roles.filter((role) => {
    const matchesDept = department === "All" || role.department === department;
    if (!query) return matchesDept;
    const q = query.toLowerCase();
    const matchesQuery =
      role.title.toLowerCase().includes(q) ||
      role.description.toLowerCase().includes(q) ||
      role.tags.some((t) => t.toLowerCase().includes(q)) ||
      role.department.toLowerCase().includes(q) ||
      role.functions.some((f) => f.name.toLowerCase().includes(q)) ||
      role.functions.some((f) => f.skills.some((s) => s.toLowerCase().includes(q)));
    return matchesDept && matchesQuery;
  });
}

const timeToValueOrder: Record<TimeToValue, number> = { "<2 weeks": 1, "2-4 weeks": 2, "1-2 months": 3 };

export function advancedFilterRoles(filters: FilterState): Role[] {
  let result = roles.filter((role) => {
    if (filters.department !== "All" && role.department !== filters.department) return false;
    if (filters.outcomeCategory !== "All" && role.outcomeCategory !== filters.outcomeCategory) return false;
    if (filters.governance !== "All" && role.governance !== filters.governance) return false;
    if (filters.complexity !== "All" && role.complexity !== filters.complexity) return false;
    if (filters.timeToValue !== "All" && role.timeToValue !== filters.timeToValue) return false;
    if (filters.systems.length > 0 && !filters.systems.some((s) => role.systems.includes(s as System))) return false;

    if (filters.query) {
      const q = filters.query.toLowerCase();
      const matchesQuery =
        role.title.toLowerCase().includes(q) ||
        role.description.toLowerCase().includes(q) ||
        role.tags.some((t) => t.toLowerCase().includes(q)) ||
        role.department.toLowerCase().includes(q) ||
        role.functions.some((f) => f.name.toLowerCase().includes(q)) ||
        role.functions.some((f) => f.skills.some((s) => s.toLowerCase().includes(q)));
      if (!matchesQuery) return false;
    }

    return true;
  });

  if (filters.sort === "name") {
    result.sort((a, b) => a.title.localeCompare(b.title));
  } else if (filters.sort === "fastest") {
    result.sort((a, b) => timeToValueOrder[a.timeToValue] - timeToValueOrder[b.timeToValue]);
  }

  return result;
}

export function getRoleById(id: string): Role | undefined {
  return roles.find((role) => role.id === id);
}

export function getRelatedRoles(role: Role): Role[] {
  return roles.filter((r) => r.department === role.department && r.id !== role.id).slice(0, 3);
}
