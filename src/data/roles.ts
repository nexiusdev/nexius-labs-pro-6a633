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
  workflow: Workflow;
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

export type Workflow = "CRM" | "ERP" | "Finance" | "HRMS";

export const workflowColors: Record<Workflow, { bg: string; text: string; accent: string; light: string; border: string }> = {
  Finance: { bg: "bg-amber-600", text: "text-amber-700", accent: "#d97706", light: "bg-amber-50", border: "border-amber-500" },
  CRM: { bg: "bg-blue-600", text: "text-blue-700", accent: "#2563eb", light: "bg-blue-50", border: "border-blue-500" },
  ERP: { bg: "bg-emerald-600", text: "text-emerald-700", accent: "#059669", light: "bg-emerald-50", border: "border-emerald-500" },
  HRMS: { bg: "bg-purple-600", text: "text-purple-700", accent: "#9333ea", light: "bg-purple-50", border: "border-purple-500" },
};

export const workflowBanners: Record<Workflow, string> = {
  CRM: "/images/banner-crm.jpg",
  ERP: "/images/banner-erp.jpg",
  Finance: "/images/banner-finance.jpg",
  HRMS: "/images/banner-hrms.jpg",
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
    workflow: "Finance",
    functionCount: 3,
    functions: [
      { name: "Invoice Processing", automationPercent: 95, skills: ["OCR extraction", "Data validation", "Three-way matching"] },
      { name: "Payment Scheduling", automationPercent: 90, skills: ["Due date tracking", "Cash flow optimization", "Batch processing"] },
      { name: "Vendor Reconciliation", automationPercent: 85, skills: ["Statement matching", "Discrepancy detection", "Auto-resolution"] },
    ],
    outcomes: [
      { value: "90% faster", label: "Invoice Processing Time", description: "From days to minutes per invoice" },
      { value: "99.8%", label: "Matching Accuracy", description: "Three-way match precision" },
      { value: "95%", label: "Late Payment Reduction", description: "Virtually eliminate late vendor payments" },
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
    workflow: "Finance",
    functionCount: 3,
    functions: [
      { name: "Invoice Generation", automationPercent: 95, skills: ["Template management", "Recurring billing", "Multi-currency"] },
      { name: "Collections Management", automationPercent: 88, skills: ["Dunning automation", "Escalation rules", "Payment reminders"] },
      { name: "Cash Application", automationPercent: 85, skills: ["Payment matching", "Partial payments", "Bank reconciliation"] },
    ],
    outcomes: [
      { value: "40%", label: "DSO Reduction", description: "Days Sales Outstanding improvement" },
      { value: "98%", label: "Collection Rate", description: "On-time payment collection" },
      { value: "85% faster", label: "Cash Application Speed", description: "Automated payment matching" },
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
    workflow: "Finance",
    functionCount: 3,
    functions: [
      { name: "Report Generation", automationPercent: 92, skills: ["P&L statements", "Balance sheet", "Cash flow reports"] },
      { name: "Data Consolidation", automationPercent: 88, skills: ["Multi-entity rollup", "Intercompany elimination", "Currency translation"] },
      { name: "Variance Analysis", automationPercent: 85, skills: ["Budget vs actual", "Trend identification", "Exception flagging"] },
    ],
    outcomes: [
      { value: "70% faster", label: "Close Time", description: "Month-end close acceleration" },
      { value: "99.9%", label: "Report Accuracy", description: "Error-free financial reports" },
      { value: "100%", label: "Compliance", description: "Regulatory deadline adherence" },
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
    workflow: "Finance",
    functionCount: 3,
    functions: [
      { name: "Expense Processing", automationPercent: 92, skills: ["Receipt OCR", "Category mapping", "Policy validation"] },
      { name: "Approval Workflows", automationPercent: 90, skills: ["Manager routing", "Exception handling", "Delegation rules"] },
      { name: "Reimbursement", automationPercent: 88, skills: ["Payment processing", "Tax calculation", "Multi-currency conversion"] },
    ],
    outcomes: [
      { value: "85% faster", label: "Processing Time", description: "Submission to reimbursement" },
      { value: "100%", label: "Policy Compliance", description: "Automated policy enforcement" },
      { value: "Real-time", label: "Cost Visibility", description: "Live spend dashboards" },
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
    workflow: "CRM",
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
    workflow: "CRM",
    functionCount: 3,
    functions: [
      { name: "Health Monitoring", automationPercent: 85, skills: ["Usage analytics", "Sentiment analysis", "Churn prediction"] },
      { name: "Onboarding Automation", automationPercent: 92, skills: ["Welcome sequences", "Milestone tracking", "Resource delivery"] },
      { name: "Renewal Management", automationPercent: 80, skills: ["Timeline tracking", "Upsell identification", "Contract processing"] },
    ],
    outcomes: [
      { value: "45%", label: "Churn Reduction", description: "Customer retention improvement" },
      { value: "60% faster", label: "Onboarding Time", description: "Time to first value" },
      { value: "+25 pts", label: "NPS Improvement", description: "Net Promoter Score lift" },
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
    workflow: "CRM",
    functionCount: 3,
    functions: [
      { name: "Lead Scoring", automationPercent: 90, skills: ["Behavioral analysis", "Firmographic matching", "Intent signals"] },
      { name: "Qualification Workflows", automationPercent: 88, skills: ["BANT criteria", "Auto-enrichment", "Nurture sequencing"] },
      { name: "Lead Routing", automationPercent: 95, skills: ["Territory mapping", "Round-robin", "Skill-based assignment"] },
    ],
    outcomes: [
      { value: "95% faster", label: "Qualification Speed", description: "Instant lead scoring" },
      { value: "+40%", label: "Conversion Rate", description: "MQL to SQL conversion lift" },
      { value: "<5 min", label: "Response Time", description: "Lead response SLA" },
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
    workflow: "CRM",
    functionCount: 3,
    functions: [
      { name: "Data Deduplication", automationPercent: 92, skills: ["Fuzzy matching", "Merge rules", "Survivor selection"] },
      { name: "Data Enrichment", automationPercent: 88, skills: ["Third-party APIs", "Social profiles", "Firmographic data"] },
      { name: "Standardization", automationPercent: 95, skills: ["Address formatting", "Phone normalization", "Industry coding"] },
    ],
    outcomes: [
      { value: "98%", label: "Duplicate Reduction", description: "Near-zero duplicate records" },
      { value: "95%", label: "Data Completeness", description: "Field fill rate improvement" },
      { value: "4.9/5", label: "Quality Score", description: "Overall data health rating" },
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
    workflow: "ERP",
    functionCount: 3,
    functions: [
      { name: "Requisition Processing", automationPercent: 90, skills: ["Auto-approval routing", "Budget validation", "Catalog matching"] },
      { name: "Vendor Management", automationPercent: 85, skills: ["Performance scoring", "Compliance tracking", "Contract management"] },
      { name: "Spend Analytics", automationPercent: 88, skills: ["Category analysis", "Savings identification", "Maverick spend detection"] },
    ],
    outcomes: [
      { value: "75% faster", label: "Processing Time", description: "Requisition to PO creation" },
      { value: "20%", label: "Cost Savings", description: "Procurement cost reduction" },
      { value: "99%", label: "Compliance Rate", description: "Policy adherence" },
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
    workflow: "ERP",
    functionCount: 3,
    functions: [
      { name: "Stock Management", automationPercent: 92, skills: ["Reorder automation", "Safety stock calculation", "ABC analysis"] },
      { name: "Demand Forecasting", automationPercent: 82, skills: ["Historical analysis", "Seasonal adjustment", "Trend detection"] },
      { name: "Warehouse Coordination", automationPercent: 85, skills: ["Pick/pack optimization", "Location management", "Cycle counting"] },
    ],
    outcomes: [
      { value: "90%", label: "Stockout Reduction", description: "Near-zero out-of-stock events" },
      { value: "30% lower", label: "Carrying Cost", description: "Inventory holding optimization" },
      { value: "88%", label: "Forecast Accuracy", description: "Demand prediction precision" },
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
    workflow: "ERP",
    functionCount: 3,
    functions: [
      { name: "Order Processing", automationPercent: 92, skills: ["Validation rules", "Credit checks", "Inventory allocation"] },
      { name: "Fulfillment Coordination", automationPercent: 88, skills: ["Warehouse routing", "Shipping selection", "Tracking updates"] },
      { name: "Returns Management", automationPercent: 85, skills: ["RMA processing", "Refund automation", "Restocking workflows"] },
    ],
    outcomes: [
      { value: "99.5%", label: "Order Accuracy", description: "Correct order fulfillment rate" },
      { value: "80% faster", label: "Processing Speed", description: "Order to shipment time" },
      { value: "24hrs", label: "Return Resolution", description: "Average return processing time" },
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
    workflow: "ERP",
    functionCount: 3,
    functions: [
      { name: "Production Scheduling", automationPercent: 85, skills: ["Capacity planning", "Job sequencing", "Constraint management"] },
      { name: "MRP Processing", automationPercent: 90, skills: ["BOM explosion", "Net requirement calc", "Planned order generation"] },
      { name: "Shop Floor Coordination", automationPercent: 82, skills: ["Work order management", "Progress tracking", "Bottleneck alerts"] },
    ],
    outcomes: [
      { value: "95%", label: "Schedule Adherence", description: "On-time production rate" },
      { value: "40% lower", label: "Material Waste", description: "Optimized material usage" },
      { value: "25% higher", label: "Throughput", description: "Production output increase" },
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
    workflow: "HRMS",
    functionCount: 3,
    functions: [
      { name: "Payroll Processing", automationPercent: 95, skills: ["Salary calculation", "Overtime computation", "Deduction management"] },
      { name: "Tax Compliance", automationPercent: 90, skills: ["Tax withholding", "Filing automation", "Multi-jurisdiction"] },
      { name: "Benefits Administration", automationPercent: 85, skills: ["Enrollment management", "Premium calculation", "Claims processing"] },
    ],
    outcomes: [
      { value: "99.99%", label: "Payroll Accuracy", description: "Zero-error payroll runs" },
      { value: "80% faster", label: "Processing Time", description: "From days to hours" },
      { value: "100%", label: "Compliance Rate", description: "Full regulatory compliance" },
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
    workflow: "HRMS",
    functionCount: 3,
    functions: [
      { name: "Candidate Screening", automationPercent: 88, skills: ["Resume parsing", "Skills matching", "Qualification scoring"] },
      { name: "Interview Management", automationPercent: 90, skills: ["Calendar coordination", "Panel scheduling", "Feedback collection"] },
      { name: "Offer Processing", automationPercent: 85, skills: ["Template generation", "Approval routing", "Document management"] },
    ],
    outcomes: [
      { value: "50% faster", label: "Time-to-Hire", description: "Accelerated hiring cycle" },
      { value: "10x", label: "Screening Efficiency", description: "Candidates processed per hour" },
      { value: "85%", label: "Offer Acceptance", description: "Improved candidate experience" },
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
    workflow: "HRMS",
    functionCount: 3,
    functions: [
      { name: "Pre-boarding Setup", automationPercent: 92, skills: ["Document collection", "System provisioning", "Equipment requests"] },
      { name: "Training Coordination", automationPercent: 85, skills: ["Learning path assignment", "Progress tracking", "Certification management"] },
      { name: "Compliance Verification", automationPercent: 90, skills: ["Background checks", "Policy acknowledgment", "Document verification"] },
    ],
    outcomes: [
      { value: "65% faster", label: "Onboarding Time", description: "Days to full productivity" },
      { value: "100%", label: "Completion Rate", description: "All tasks completed on time" },
      { value: "4.8/5", label: "New Hire Satisfaction", description: "Onboarding experience rating" },
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
    workflow: "HRMS",
    functionCount: 3,
    functions: [
      { name: "Time Tracking", automationPercent: 92, skills: ["Clock-in/out automation", "Timesheet approval", "Overtime calculation"] },
      { name: "Leave Management", automationPercent: 95, skills: ["Request processing", "Accrual calculation", "Balance tracking"] },
      { name: "Attendance Analytics", automationPercent: 88, skills: ["Pattern detection", "Absenteeism alerts", "Compliance reporting"] },
    ],
    outcomes: [
      { value: "90% faster", label: "Processing Time", description: "Leave request resolution" },
      { value: "99.9%", label: "Accuracy", description: "Time and attendance records" },
      { value: "4.7/5", label: "Employee Satisfaction", description: "Self-service experience" },
    ],
    governance: "Auto",
    complexity: "Starter",
    timeToValue: "<2 weeks",
    outcomeCategory: "Speed",
    systems: ["HRMS"],
  },
  {
    id: "supply-chain-coordinator",
    title: "Supply Chain Coordinator",
    image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    description: "Coordinates supply chain and logistics operations.",
    detailedDescription: "Coordinates end-to-end supply chain operations from planning through delivery. Manages supplier relationships, optimizes logistics routes, and ensures timely delivery while minimizing transportation costs.",
    tags: ["Plan-to-Deliver", "Supplier Management", "Logistics Optimization"],
    kpi: "On-Time Delivery Rate",
    workflow: "ERP",
    functionCount: 3,
    functions: [
      { name: "Supplier Coordination", automationPercent: 85, skills: ["Order scheduling", "Lead time tracking", "Quality monitoring"] },
      { name: "Logistics Management", automationPercent: 88, skills: ["Route optimization", "Carrier selection", "Shipment tracking"] },
      { name: "Supply Chain Analytics", automationPercent: 82, skills: ["Bottleneck detection", "Risk assessment", "Performance dashboards"] },
    ],
    outcomes: [
      { value: "30% faster", label: "Delivery Time", description: "End-to-end cycle reduction" },
      { value: "25% lower", label: "Supply Chain Cost", description: "Total logistics savings" },
      { value: "97%", label: "On-Time Delivery", description: "Shipment SLA adherence" },
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
    workflow: "ERP",
    functionCount: 3,
    functions: [
      { name: "Quality Inspection", automationPercent: 85, skills: ["Checklist automation", "Measurement recording", "Photo documentation"] },
      { name: "Non-Conformance Tracking", automationPercent: 82, skills: ["Issue logging", "Root cause analysis", "CAPA management"] },
      { name: "Compliance Monitoring", automationPercent: 88, skills: ["ISO standards", "Regulatory checks", "Audit trail maintenance"] },
    ],
    outcomes: [
      { value: "95%", label: "Defect Detection", description: "Early detection rate" },
      { value: "Always", label: "Audit Readiness", description: "Perpetual compliance state" },
      { value: "60% faster", label: "Resolution Time", description: "Issue to resolution speed" },
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
    workflow: "ERP",
    functionCount: 3,
    functions: [
      { name: "Document Processing", automationPercent: 95, skills: ["OCR extraction", "Template recognition", "Field mapping"] },
      { name: "Data Validation", automationPercent: 92, skills: ["Cross-reference checks", "Format standardization", "Duplicate detection"] },
      { name: "System Entry", automationPercent: 90, skills: ["Multi-system input", "Batch processing", "Error handling"] },
    ],
    outcomes: [
      { value: "20x faster", label: "Processing Speed", description: "vs manual data entry" },
      { value: "99.9%", label: "Accuracy Rate", description: "Near-zero error rate" },
      { value: "10,000/day", label: "Volume Capacity", description: "Documents processed daily" },
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
    workflow: "Finance",
    functionCount: 3,
    functions: [
      { name: "Regulatory Monitoring", automationPercent: 82, skills: ["Rule tracking", "Impact assessment", "Update notifications"] },
      { name: "Compliance Workflows", automationPercent: 88, skills: ["Policy enforcement", "Approval chains", "Exception management"] },
      { name: "Audit Management", automationPercent: 85, skills: ["Evidence collection", "Report generation", "Finding tracking"] },
    ],
    outcomes: [
      { value: "99.9%", label: "Compliance Rate", description: "Regulatory adherence" },
      { value: "75% faster", label: "Audit Prep Time", description: "Always audit-ready" },
      { value: "Real-time", label: "Risk Detection", description: "Continuous risk monitoring" },
    ],
    governance: "Approval Required",
    complexity: "Advanced",
    timeToValue: "1-2 months",
    outcomeCategory: "Control",
    systems: ["ERP", "Finance", "ITSM"],
  },
];

export const workflows: Workflow[] = ["Finance", "CRM", "ERP", "HRMS"];
export const governanceOptions: Governance[] = ["Auto", "Approval Required", "Exception-only"];
export const complexityOptions: Complexity[] = ["Starter", "Intermediate", "Advanced"];
export const timeToValueOptions: TimeToValue[] = ["<2 weeks", "2-4 weeks", "1-2 months"];
export const outcomeCategoryOptions: OutcomeCategory[] = ["Speed", "Reliability", "Cashflow", "Control"];
export const systemOptions: System[] = ["ATS", "CRM", "ERP", "Finance", "HRMS", "ITSM", "MAP", "WMS"];

export interface FilterState {
  query: string;
  workflow: string;
  outcomeCategory: string;
  governance: string;
  complexity: string;
  timeToValue: string;
  systems: string[];
  sort: string;
}

export function filterRoles(query: string, workflow: string): Role[] {
  return roles.filter((role) => {
    const matchesWorkflow = workflow === "All" || role.workflow === workflow;
    if (!query) return matchesWorkflow;
    const q = query.toLowerCase();
    const matchesQuery =
      role.title.toLowerCase().includes(q) ||
      role.description.toLowerCase().includes(q) ||
      role.tags.some((t) => t.toLowerCase().includes(q)) ||
      role.workflow.toLowerCase().includes(q) ||
      role.functions.some((f) => f.name.toLowerCase().includes(q)) ||
      role.functions.some((f) => f.skills.some((s) => s.toLowerCase().includes(q)));
    return matchesWorkflow && matchesQuery;
  });
}

const timeToValueOrder: Record<TimeToValue, number> = { "<2 weeks": 1, "2-4 weeks": 2, "1-2 months": 3 };

export function advancedFilterRoles(filters: FilterState): Role[] {
  let result = roles.filter((role) => {
    if (filters.workflow !== "All" && role.workflow !== filters.workflow) return false;
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
        role.workflow.toLowerCase().includes(q) ||
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
  return roles.filter((r) => r.workflow === role.workflow && r.id !== role.id).slice(0, 3);
}
