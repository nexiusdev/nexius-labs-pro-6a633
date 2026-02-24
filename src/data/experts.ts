export interface Expert {
  id: string;
  name: string;
  title: string;
  location: string;
  image: string;
  about: string;
  headline: string;
  expertise: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  certifications: string[];
  roleIds: string[];
}

export interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  description: string;
}

export interface EducationItem {
  degree: string;
  institution: string;
  year: string;
}

export const experts: Expert[] = [
  {
    id: "sarah-chen",
    name: "Sarah Chen",
    title: "Finance Automation Lead",
    location: "Singapore",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    headline: "Transforming finance operations through intelligent automation. 12+ years in enterprise finance systems.",
    about: "I design and build AI-powered digital colleagues that transform how finance teams work. With over 12 years of experience in enterprise finance systems across APAC, I specialize in automating accounts payable, receivable, and expense management workflows. My approach combines deep domain expertise with cutting-edge AI to deliver measurable ROI within weeks, not months.",
    expertise: ["Accounts Payable Automation", "Invoice Processing", "Three-Way Matching", "ERP Integration", "Financial Controls", "Process Optimization", "SAP", "Oracle Financials"],
    experience: [
      { role: "Finance Automation Lead", company: "Nexius Labs", period: "2023 – Present", description: "Lead the design and deployment of AI-powered finance digital colleagues, reducing invoice processing time by 85% across 15+ enterprise clients." },
      { role: "Senior Finance Systems Consultant", company: "Deloitte Digital", period: "2019 – 2023", description: "Advised Fortune 500 clients on finance automation strategy, implementing RPA and AI solutions across AP, AR, and expense management." },
      { role: "Finance Operations Manager", company: "DBS Bank", period: "2014 – 2019", description: "Managed a team of 25+ handling $2B+ in annual transactions. Pioneered the bank's first automated reconciliation system." },
    ],
    education: [
      { degree: "MBA, Finance & Technology", institution: "INSEAD", year: "2014" },
      { degree: "BSc Accounting", institution: "National University of Singapore", year: "2011" },
    ],
    certifications: ["CPA (Singapore)", "SAP S/4HANA Finance Certified", "UiPath Advanced RPA Developer"],
    roleIds: ["accounts-payable-specialist", "expense-management-coordinator"],
  },
  {
    id: "michael-torres",
    name: "Michael Torres",
    title: "Financial Systems Architect",
    location: "Manila, Philippines",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    headline: "Architecting intelligent financial reporting and collections systems. Former Big 4 audit technologist.",
    about: "I architect AI systems that automate financial reporting, collections, and cash application workflows. My background in audit technology gives me a unique perspective on building systems that are not only efficient but fully compliant. I've helped organizations reduce their month-end close from 10 days to 3 days while improving accuracy to 99.5%+.",
    expertise: ["Financial Reporting", "Revenue Recognition", "Collections Automation", "Cash Application", "Month-End Close", "IFRS/GAAP Compliance", "Audit Technology", "Power BI"],
    experience: [
      { role: "Financial Systems Architect", company: "Nexius Labs", period: "2023 – Present", description: "Design and implement AI-powered financial reporting and AR management digital colleagues for mid-market enterprises." },
      { role: "Audit Technology Director", company: "PwC Philippines", period: "2018 – 2023", description: "Led a 40-person team building automated audit tools and financial reporting systems for banking and insurance clients." },
      { role: "Senior Financial Analyst", company: "Ayala Corporation", period: "2013 – 2018", description: "Managed financial reporting for a $9B conglomerate, implementing the first automated consolidation and reporting platform." },
    ],
    education: [
      { degree: "MSc Financial Engineering", institution: "Ateneo de Manila University", year: "2013" },
      { degree: "BSc Accountancy", institution: "University of the Philippines", year: "2010" },
    ],
    certifications: ["CPA (Philippines)", "CFA Level III", "Microsoft Power Platform Certified"],
    roleIds: ["accounts-receivable-manager", "financial-reporting-analyst"],
  },
  {
    id: "priya-sharma",
    name: "Priya Sharma",
    title: "CRM Strategy Director",
    location: "Bangalore, India",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    headline: "Building AI-powered sales and customer success engines. 10+ years in CRM transformation.",
    about: "I design intelligent CRM digital colleagues that transform how organizations manage their sales pipeline and customer relationships. With a decade of experience across Salesforce, HubSpot, and custom CRM implementations, I understand the nuances of sales operations and customer success at scale. My digital colleagues have collectively driven $50M+ in pipeline acceleration.",
    expertise: ["Sales Operations", "Pipeline Management", "CRM Architecture", "Customer Success", "Salesforce", "HubSpot", "Revenue Operations", "Churn Prevention"],
    experience: [
      { role: "CRM Strategy Director", company: "Nexius Labs", period: "2022 – Present", description: "Lead the CRM digital colleagues practice, designing AI-powered sales and customer success automation for 20+ clients." },
      { role: "VP Revenue Operations", company: "Freshworks", period: "2018 – 2022", description: "Built and scaled the RevOps function from 5 to 60+ people, driving 3x revenue growth through CRM automation." },
      { role: "Salesforce Practice Lead", company: "Accenture India", period: "2014 – 2018", description: "Led Salesforce implementations for enterprise clients across APAC, managing $15M+ in project portfolios." },
    ],
    education: [
      { degree: "MBA, Marketing & Analytics", institution: "Indian School of Business", year: "2014" },
      { degree: "BTech Computer Science", institution: "IIT Bombay", year: "2011" },
    ],
    certifications: ["Salesforce Certified Technical Architect", "HubSpot Solutions Partner", "Google Analytics Certified"],
    roleIds: ["sales-operations-coordinator", "customer-success-associate"],
  },
  {
    id: "james-okafor",
    name: "James Okafor",
    title: "Customer Intelligence Lead",
    location: "Lagos, Nigeria",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    headline: "Turning data into customer intelligence. Specialist in lead scoring, qualification, and CRM data integrity.",
    about: "I build AI systems that transform raw customer data into actionable intelligence. My expertise spans lead scoring algorithms, automated qualification workflows, and CRM data governance. Before joining Nexius Labs, I built the data science team at one of Africa's fastest-growing fintechs, where I developed scoring models that tripled conversion rates.",
    expertise: ["Lead Scoring", "Data Quality", "CRM Data Governance", "Marketing Automation", "Machine Learning", "Customer Segmentation", "A/B Testing", "Data Enrichment"],
    experience: [
      { role: "Customer Intelligence Lead", company: "Nexius Labs", period: "2023 – Present", description: "Design AI-powered lead qualification and CRM data management digital colleagues, serving clients across 8 countries." },
      { role: "Head of Data Science", company: "Flutterwave", period: "2019 – 2023", description: "Built the data science team from scratch, developing ML models for customer scoring, fraud detection, and churn prediction." },
      { role: "CRM Analytics Manager", company: "Microsoft (Lagos)", period: "2016 – 2019", description: "Led CRM analytics for the West Africa region, improving lead-to-opportunity conversion by 180% through data-driven scoring." },
    ],
    education: [
      { degree: "MSc Data Science", institution: "University of Edinburgh", year: "2016" },
      { degree: "BSc Mathematics", institution: "University of Lagos", year: "2013" },
    ],
    certifications: ["Google Cloud Professional Data Engineer", "Salesforce Marketing Cloud Certified", "AWS Machine Learning Specialty"],
    roleIds: ["lead-qualification-specialist", "crm-data-steward"],
  },
  {
    id: "emma-lindqvist",
    name: "Emma Lindqvist",
    title: "ERP Solutions Architect",
    location: "Stockholm, Sweden",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    headline: "Enterprise ERP automation architect. SAP and Oracle specialist with 15+ years in manufacturing and procurement.",
    about: "I architect intelligent ERP digital colleagues that streamline procurement, inventory, and order management for manufacturing and distribution companies. With 15 years of experience implementing SAP and Oracle across Europe and APAC, I bring deep understanding of complex supply chain processes. My solutions have saved clients over $20M in operational costs.",
    expertise: ["SAP S/4HANA", "Oracle ERP Cloud", "Procurement Automation", "Inventory Optimization", "Order Management", "Supply Chain Planning", "Warehouse Management", "MRP"],
    experience: [
      { role: "ERP Solutions Architect", company: "Nexius Labs", period: "2022 – Present", description: "Architect AI-powered ERP digital colleagues for procurement, inventory, and order management across manufacturing clients." },
      { role: "SAP Practice Director", company: "Capgemini Nordics", period: "2016 – 2022", description: "Led SAP transformation programs worth €50M+ for IKEA, Volvo, and Ericsson, focusing on procure-to-pay and manufacturing." },
      { role: "ERP Implementation Consultant", company: "SAP SE", period: "2010 – 2016", description: "Implemented SAP solutions across 30+ enterprise clients in manufacturing, retail, and distribution." },
    ],
    education: [
      { degree: "MSc Industrial Engineering", institution: "KTH Royal Institute of Technology", year: "2010" },
      { degree: "BSc Business Administration", institution: "Stockholm School of Economics", year: "2008" },
    ],
    certifications: ["SAP S/4HANA Certified Solution Architect", "Oracle ERP Cloud Certified", "APICS CSCP"],
    roleIds: ["procurement-analyst", "order-management-specialist"],
  },
  {
    id: "raj-patel",
    name: "Raj Patel",
    title: "Supply Chain Technologist",
    location: "Mumbai, India",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    headline: "Optimizing inventory and production through AI. 14 years in supply chain technology and demand planning.",
    about: "I build AI digital colleagues that optimize inventory levels, production scheduling, and demand planning. My career spans 14 years across automotive, pharmaceutical, and FMCG supply chains, where I've implemented systems that reduced stockouts by 80% and carrying costs by 30%. I believe the future of supply chain management is AI-augmented decision-making.",
    expertise: ["Inventory Optimization", "Demand Planning", "Production Scheduling", "MRP Systems", "Warehouse Automation", "Supply Chain Analytics", "Lean Manufacturing", "Six Sigma"],
    experience: [
      { role: "Supply Chain Technologist", company: "Nexius Labs", period: "2023 – Present", description: "Design AI-powered inventory and production planning digital colleagues for manufacturing and distribution clients." },
      { role: "Director of Supply Chain Innovation", company: "Tata Consultancy Services", period: "2017 – 2023", description: "Led supply chain automation practice serving automotive and pharma clients, driving $100M+ in efficiency gains." },
      { role: "Senior Supply Chain Analyst", company: "Unilever India", period: "2012 – 2017", description: "Managed demand planning and inventory optimization for 500+ SKUs across the Indian subcontinent." },
    ],
    education: [
      { degree: "MBA, Operations Management", institution: "IIM Ahmedabad", year: "2012" },
      { degree: "BTech Mechanical Engineering", institution: "IIT Delhi", year: "2009" },
    ],
    certifications: ["APICS CPIM", "Six Sigma Black Belt", "AWS Solutions Architect Associate"],
    roleIds: ["inventory-controller", "production-planning-analyst"],
  },
  {
    id: "aisha-rahman",
    name: "Aisha Rahman",
    title: "People Operations Lead",
    location: "Kuala Lumpur, Malaysia",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    headline: "Reimagining HR through intelligent automation. Specialist in payroll, onboarding, and employee experience.",
    about: "I design AI digital colleagues that transform people operations — from payroll processing to employee onboarding and attendance management. With experience across Southeast Asia's diverse regulatory environments, I build systems that handle multi-country compliance effortlessly. My digital colleagues have processed payroll for 100,000+ employees with 99.5%+ accuracy.",
    expertise: ["Payroll Automation", "Employee Onboarding", "Leave Management", "HR Compliance", "Workday", "SAP SuccessFactors", "Multi-Country Payroll", "Employee Experience"],
    experience: [
      { role: "People Operations Lead", company: "Nexius Labs", period: "2022 – Present", description: "Lead the HRMS digital colleagues practice, automating payroll, onboarding, and attendance for clients across 6 ASEAN countries." },
      { role: "Regional HR Technology Manager", company: "Grab", period: "2018 – 2022", description: "Built and managed HR tech stack for 30,000+ employees across 8 countries, automating payroll and leave management." },
      { role: "HR Systems Consultant", company: "Mercer", period: "2014 – 2018", description: "Implemented Workday and SuccessFactors for multinational companies across Malaysia, Singapore, and Indonesia." },
    ],
    education: [
      { degree: "MBA, Human Capital Management", institution: "University of Malaya", year: "2014" },
      { degree: "BSc Psychology", institution: "Monash University Malaysia", year: "2011" },
    ],
    certifications: ["SHRM-SCP", "Workday HCM Certified", "SAP SuccessFactors Certified"],
    roleIds: ["payroll-administrator", "employee-onboarding-specialist"],
  },
  {
    id: "david-kim",
    name: "David Kim",
    title: "HR Technology Strategist",
    location: "Seoul, South Korea",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    headline: "Building the future of talent acquisition and workforce management. Former Samsung HR Innovation lead.",
    about: "I build AI digital colleagues that revolutionize recruitment, talent management, and workforce analytics. After leading HR innovation at Samsung for 5 years, I bring a unique perspective on how AI can enhance every touchpoint of the employee lifecycle. My recruitment digital colleagues have reduced time-to-hire by 60% while improving candidate quality scores by 40%.",
    expertise: ["Recruitment Automation", "Talent Acquisition", "ATS Integration", "Workforce Analytics", "Interview Scheduling", "Candidate Scoring", "HR Analytics", "Diversity & Inclusion"],
    experience: [
      { role: "HR Technology Strategist", company: "Nexius Labs", period: "2023 – Present", description: "Design AI-powered recruitment and workforce management digital colleagues for enterprise clients across Asia." },
      { role: "Director of HR Innovation", company: "Samsung Electronics", period: "2018 – 2023", description: "Led a 20-person team building AI-powered recruitment and talent management tools for 270,000+ employees globally." },
      { role: "HR Analytics Lead", company: "McKinsey & Company (Seoul)", period: "2015 – 2018", description: "Advised Fortune 500 clients on HR transformation and people analytics strategy across APAC." },
    ],
    education: [
      { degree: "MS Computer Science (AI focus)", institution: "KAIST", year: "2015" },
      { degree: "BA Economics", institution: "Seoul National University", year: "2012" },
    ],
    certifications: ["Google Professional Machine Learning Engineer", "SHRM-CP", "Tableau Desktop Certified"],
    roleIds: ["recruitment-coordinator", "leave-attendance-manager"],
  },
  {
    id: "olivia-nakamura",
    name: "Olivia Nakamura",
    title: "ERP & Supply Chain Lead",
    location: "Tokyo, Japan",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    headline: "Driving supply chain and quality excellence through AI automation. Toyota Production System meets intelligent digital workers.",
    about: "I design AI digital colleagues that drive operational excellence in supply chain, quality assurance, and compliance. My background in Toyota Production System and lean manufacturing gives me a unique approach to automation — every digital colleague I build embodies continuous improvement principles. I've deployed solutions across 50+ manufacturing and logistics facilities.",
    expertise: ["Supply Chain Management", "Quality Assurance", "Lean Manufacturing", "Process Automation", "Compliance Management", "ISO Standards", "Continuous Improvement", "Kaizen"],
    experience: [
      { role: "ERP & Supply Chain Lead", company: "Nexius Labs", period: "2022 – Present", description: "Lead the ERP and supply chain digital colleagues practice, automating supply chain, QA, and compliance workflows for industrial clients." },
      { role: "Supply Chain Innovation Manager", company: "Toyota Motor Corporation", period: "2016 – 2022", description: "Led digital transformation initiatives applying TPS principles to AI-powered automation across 12 manufacturing plants." },
      { role: "Supply Chain Consultant", company: "BCG Tokyo", period: "2013 – 2016", description: "Advised automotive and electronics manufacturers on supply chain optimization and quality management systems." },
    ],
    education: [
      { degree: "MBA, Operations Management", institution: "Keio Business School", year: "2013" },
      { degree: "BEng Industrial Engineering", institution: "University of Tokyo", year: "2010" },
    ],
    certifications: ["Lean Six Sigma Master Black Belt", "APICS SCOR-P", "ISO 9001 Lead Auditor"],
    roleIds: ["supply-chain-coordinator", "quality-assurance-monitor"],
  },
  {
    id: "marcus-weber",
    name: "Marcus Weber",
    title: "Process Automation Architect",
    location: "Berlin, Germany",
    image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=faces&auto=format&q=80",
    headline: "Enterprise process automation at scale. Specialist in data processing, compliance systems, and digital operations.",
    about: "I architect AI digital colleagues for high-volume data processing, compliance monitoring, and enterprise operations. With a background in building scalable automation platforms at Siemens, I focus on creating digital colleagues that handle millions of transactions with enterprise-grade reliability. My solutions have automated 95%+ of manual data entry across multiple industries.",
    expertise: ["Data Processing Automation", "Compliance Systems", "Enterprise Architecture", "Document OCR", "Regulatory Technology", "Risk Management", "Data Migration", "Process Mining"],
    experience: [
      { role: "Process Automation Architect", company: "Nexius Labs", period: "2023 – Present", description: "Architect high-volume data processing and compliance digital colleagues for financial services and manufacturing clients." },
      { role: "Head of Intelligent Automation", company: "Siemens Digital Industries", period: "2017 – 2023", description: "Led the intelligent automation CoE, deploying 200+ automation solutions processing 10M+ documents annually." },
      { role: "Solutions Architect", company: "SAP SE (Walldorf)", period: "2013 – 2017", description: "Designed enterprise integration and process automation solutions for DAX 30 companies." },
    ],
    education: [
      { degree: "MSc Computer Science", institution: "Technical University of Munich", year: "2013" },
      { degree: "BSc Information Systems", institution: "University of Mannheim", year: "2011" },
    ],
    certifications: ["AWS Solutions Architect Professional", "TOGAF 9 Certified", "ITIL v4 Expert"],
    roleIds: ["data-entry-processor", "compliance-officer"],
  },
];

// Helper to get expert by ID
export function getExpertById(id: string): Expert | undefined {
  return experts.find((e) => e.id === id);
}

// Helper to get expert for a given role ID
export function getExpertByRoleId(roleId: string): Expert | undefined {
  return experts.find((e) => e.roleIds.includes(roleId));
}
