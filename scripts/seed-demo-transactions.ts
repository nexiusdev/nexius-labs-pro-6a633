import { Client } from "pg";

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

async function main() {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query("begin");

    // Reset transactional demo data
    await client.query(`
      truncate table
        nexius_os.interview_messages,
        nexius_os.interview_sessions,
        nexius_os.shortlist_items,
        nexius_os.shortlist_sessions,
        nexius_os.lead_events,
        nexius_os.leads
      restart identity cascade;
    `);

    // Demo leads
    const leads = [
      {
        full_name: "Adrian Lim",
        company: "Vertex Components Pte Ltd",
        email: "adrian.lim@vertexcomponents.com",
        phone: "+65 9123 4567",
        company_size: "51-200",
        interest: "ERP Automation",
        message: "We need better order-to-cash control and fewer fulfillment exceptions.",
        source_page: "/roles/order-management-specialist",
        utm_source: "linkedin",
        utm_medium: "organic",
        utm_campaign: "erp-o2c-q1",
        referrer: "https://linkedin.com",
        status: "new",
        owner: "sales@demo",
      },
      {
        full_name: "Rachel Tan",
        company: "Northstar Retail Group",
        email: "rachel.tan@northstarretail.sg",
        phone: "+65 9876 4321",
        company_size: "201-500",
        interest: "Finance & Accounting",
        message: "Looking to reduce DSO and automate collections follow-ups.",
        source_page: "/contact",
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: "finance-automation",
        referrer: "https://www.google.com",
        status: "qualified",
        owner: "finance@demo",
      },
      {
        full_name: "Marcus Lee",
        company: "Helio Logistics",
        email: "marcus.lee@heliologistics.com",
        phone: "+65 9011 2233",
        company_size: "11-50",
        interest: "Supply Chain & Logistics",
        message: "Need inventory and dispatch visibility with SLA alerts.",
        source_page: "/how-it-works",
        utm_source: "newsletter",
        utm_medium: "email",
        utm_campaign: "weekly-ops-digest",
        referrer: "https://mail.google.com",
        status: "contacted",
        owner: "ops@demo",
      },
      {
        full_name: "Joanne Ng",
        company: "Aurora MedTech",
        email: "joanne.ng@auroramedtech.com",
        phone: "+65 9333 7788",
        company_size: "51-200",
        interest: "HR & Payroll",
        message: "Payroll accuracy is fine but onboarding takes too long.",
        source_page: "/roles/employee-onboarding-specialist",
        utm_source: "facebook",
        utm_medium: "paid_social",
        utm_campaign: "hrms-automation",
        referrer: "https://facebook.com",
        status: "new",
        owner: "hr@demo",
      },
      {
        full_name: "Daniel Koh",
        company: "Summit Advisory",
        email: "daniel.koh@summitadvisory.co",
        phone: "+65 9555 8899",
        company_size: "1-10",
        interest: "CRM & Sales",
        message: "Need lead qualification and routing within 5 minutes.",
        source_page: "/roles/lead-qualification-specialist",
        utm_source: "direct",
        utm_medium: "none",
        utm_campaign: "brand",
        referrer: "",
        status: "new",
        owner: "revops@demo",
      },
    ];

    const insertedLeadIds: string[] = [];
    for (const lead of leads) {
      const res = await client.query(
        `insert into nexius_os.leads
          (full_name, company, email, phone, company_size, interest, message, source_page, utm_source, utm_medium, utm_campaign, referrer, status, owner)
         values
          ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         returning id`,
        [
          lead.full_name,
          lead.company,
          lead.email,
          lead.phone,
          lead.company_size,
          lead.interest,
          lead.message,
          lead.source_page,
          lead.utm_source,
          lead.utm_medium,
          lead.utm_campaign,
          lead.referrer || null,
          lead.status,
          lead.owner,
        ]
      );
      insertedLeadIds.push(res.rows[0].id);
    }

    // Lead events
    for (let i = 0; i < insertedLeadIds.length; i++) {
      const leadId = insertedLeadIds[i];
      await client.query(
        `insert into nexius_os.lead_events (lead_id, event_type, payload)
         values ($1, $2, $3::jsonb)`,
        [leadId, "lead_created", JSON.stringify({ source: leads[i].source_page })]
      );

      if ([1, 2].includes(i)) {
        await client.query(
          `insert into nexius_os.lead_events (lead_id, event_type, payload)
           values ($1, $2, $3::jsonb)`,
          [leadId, "owner_assigned", JSON.stringify({ owner: leads[i].owner })]
        );
      }
    }

    // Shortlist sessions + items
    const shortlistSeeds = [
      {
        visitor_id: "visitor-demo-001",
        role_ids: ["lead-qualification-specialist", "sales-operations-coordinator", "crm-data-steward"],
      },
      {
        visitor_id: "visitor-demo-002",
        role_ids: ["accounts-receivable-manager", "financial-reporting-analyst", "compliance-officer"],
      },
      {
        visitor_id: "visitor-demo-003",
        role_ids: ["order-management-specialist", "inventory-controller", "supply-chain-coordinator"],
      },
    ];

    for (const s of shortlistSeeds) {
      const sessionRes = await client.query(
        `insert into nexius_os.shortlist_sessions (visitor_id, email)
         values ($1, $2)
         returning id`,
        [s.visitor_id, `${s.visitor_id}@demo.local`]
      );
      const sessionId = sessionRes.rows[0].id;

      for (const roleId of s.role_ids) {
        await client.query(
          `insert into nexius_os.shortlist_items (session_id, role_id)
           values ($1, $2)
           on conflict (session_id, role_id) do nothing`,
          [sessionId, roleId]
        );
      }
    }

    // Interview sessions + messages
    const interviewSeeds = [
      {
        visitor_id: "visitor-demo-001",
        role_id: "lead-qualification-specialist",
        messages: [
          { role: "system", text: "Interview started for Lead Qualification Specialist." },
          { role: "user", text: "How do you keep lead response under 5 minutes?" },
          { role: "assistant", text: "I trigger instant scoring and auto-route qualified leads by territory and skill." },
          { role: "user", text: "What needs approval?" },
          { role: "assistant", text: "Only high-risk exception routes and override actions require manual approval." },
        ],
      },
      {
        visitor_id: "visitor-demo-002",
        role_id: "accounts-receivable-manager",
        messages: [
          { role: "system", text: "Interview started for Accounts Receivable Manager." },
          { role: "user", text: "How do you reduce DSO?" },
          { role: "assistant", text: "Automated dunning, smart escalation and cash application improve collection speed." },
          { role: "user", text: "Can we enforce escalation at 30/60/90?" },
          { role: "assistant", text: "Yes, policy-based escalation bands are configurable and audited." },
        ],
      },
      {
        visitor_id: "visitor-demo-003",
        role_id: "order-management-specialist",
        messages: [
          { role: "system", text: "Interview started for Order Management Specialist." },
          { role: "user", text: "How do you handle stock shortfall exceptions?" },
          { role: "assistant", text: "I place orders into exception queues and route alternatives by SLA and margin rules." },
          { role: "user", text: "Can warehouse team override?" },
          { role: "assistant", text: "Yes, with approval-gated override and full audit trail." },
        ],
      },
    ];

    for (const seed of interviewSeeds) {
      const sessionRes = await client.query(
        `insert into nexius_os.interview_sessions (visitor_id, role_id)
         values ($1, $2)
         returning id`,
        [seed.visitor_id, seed.role_id]
      );
      const sessionId = sessionRes.rows[0].id;

      for (let i = 0; i < seed.messages.length; i++) {
        const m = seed.messages[i] as { role: "system" | "user" | "assistant"; text: string };
        const timestamp = Date.now() + i;
        await client.query(
          `insert into nexius_os.interview_messages (session_id, role, text, timestamp_ms, seq)
           values ($1, $2, $3, $4, $5)`,
          [sessionId, m.role, m.text, timestamp, i + 1]
        );
      }
    }

    await client.query("commit");

    const summary = await client.query(`
      select
        (select count(*) from nexius_os.leads) as leads,
        (select count(*) from nexius_os.lead_events) as lead_events,
        (select count(*) from nexius_os.shortlist_sessions) as shortlist_sessions,
        (select count(*) from nexius_os.shortlist_items) as shortlist_items,
        (select count(*) from nexius_os.interview_sessions) as interview_sessions,
        (select count(*) from nexius_os.interview_messages) as interview_messages;
    `);

    console.log("Demo transaction seed complete:", summary.rows[0]);
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
