-- Nexius OS staging schema
create schema if not exists nexius_os;

-- enums
create type nexius_os.governance_t as enum ('Auto','Approval Required','Exception-only');
create type nexius_os.complexity_t as enum ('Starter','Intermediate','Advanced');
create type nexius_os.time_to_value_t as enum ('<2 weeks','2-4 weeks','1-2 months');
create type nexius_os.outcome_category_t as enum ('Speed','Reliability','Cashflow','Control');
create type nexius_os.workflow_t as enum ('CRM','ERP','Finance','HRMS');

create table if not exists nexius_os.workflows (
  id uuid primary key default gen_random_uuid(),
  code nexius_os.workflow_t unique not null,
  name text not null,
  banner_image text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists nexius_os.systems (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists nexius_os.roles (
  id text primary key,
  title text not null,
  description text not null,
  detailed_description text,
  workflow_code nexius_os.workflow_t not null,
  kpi text,
  governance nexius_os.governance_t not null,
  complexity nexius_os.complexity_t not null,
  time_to_value nexius_os.time_to_value_t not null,
  outcome_category nexius_os.outcome_category_t not null,
  image_url text,
  function_count int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists nexius_os.role_functions (
  id uuid primary key default gen_random_uuid(),
  role_id text not null references nexius_os.roles(id) on delete cascade,
  name text not null,
  automation_percent int not null check (automation_percent >= 0 and automation_percent <= 100),
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists nexius_os.skills (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  category text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists nexius_os.role_function_skills (
  role_function_id uuid not null references nexius_os.role_functions(id) on delete cascade,
  skill_id uuid not null references nexius_os.skills(id) on delete cascade,
  sort_order int default 0,
  primary key (role_function_id, skill_id)
);

create table if not exists nexius_os.role_outcomes (
  id uuid primary key default gen_random_uuid(),
  role_id text not null references nexius_os.roles(id) on delete cascade,
  value text not null,
  label text not null,
  description text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists nexius_os.tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  type text default 'general',
  created_at timestamptz default now()
);

create table if not exists nexius_os.role_tag_map (
  role_id text not null references nexius_os.roles(id) on delete cascade,
  tag_id uuid not null references nexius_os.tags(id) on delete cascade,
  primary key (role_id, tag_id)
);

create table if not exists nexius_os.role_system_map (
  role_id text not null references nexius_os.roles(id) on delete cascade,
  system_id uuid not null references nexius_os.systems(id) on delete cascade,
  primary key (role_id, system_id)
);

create table if not exists nexius_os.experts (
  id text primary key,
  name text not null,
  title text not null,
  location text,
  image_url text,
  about text,
  headline text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists nexius_os.expert_expertise (
  id uuid primary key default gen_random_uuid(),
  expert_id text not null references nexius_os.experts(id) on delete cascade,
  expertise text not null,
  sort_order int default 0
);

create table if not exists nexius_os.expert_experience (
  id uuid primary key default gen_random_uuid(),
  expert_id text not null references nexius_os.experts(id) on delete cascade,
  role_title text not null,
  company text,
  period_text text,
  description text,
  sort_order int default 0
);

create table if not exists nexius_os.expert_education (
  id uuid primary key default gen_random_uuid(),
  expert_id text not null references nexius_os.experts(id) on delete cascade,
  degree text,
  institution text,
  year text,
  sort_order int default 0
);

create table if not exists nexius_os.expert_certifications (
  id uuid primary key default gen_random_uuid(),
  expert_id text not null references nexius_os.experts(id) on delete cascade,
  certification text not null,
  sort_order int default 0
);

create table if not exists nexius_os.expert_role_map (
  expert_id text not null references nexius_os.experts(id) on delete cascade,
  role_id text not null references nexius_os.roles(id) on delete cascade,
  primary key (expert_id, role_id)
);

create table if not exists nexius_os.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  company text,
  email text not null,
  phone text,
  company_size text,
  interest text,
  message text,
  source_page text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer text,
  status text default 'new',
  owner text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists nexius_os.lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references nexius_os.leads(id) on delete cascade,
  event_type text not null,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists nexius_os.shortlist_sessions (
  id uuid primary key default gen_random_uuid(),
  visitor_id text,
  email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists nexius_os.shortlist_items (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references nexius_os.shortlist_sessions(id) on delete cascade,
  role_id text not null references nexius_os.roles(id) on delete cascade,
  added_at timestamptz default now(),
  unique (session_id, role_id)
);

create table if not exists nexius_os.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  visitor_id text,
  role_id text not null references nexius_os.roles(id) on delete cascade,
  started_at timestamptz default now(),
  last_active_at timestamptz default now()
);

create table if not exists nexius_os.interview_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references nexius_os.interview_sessions(id) on delete cascade,
  role text not null check (role in ('system','user','assistant')),
  text text not null,
  timestamp_ms bigint,
  seq int,
  created_at timestamptz default now()
);

create index if not exists idx_roles_workflow on nexius_os.roles(workflow_code);
create index if not exists idx_roles_governance on nexius_os.roles(governance);
create index if not exists idx_roles_ttv on nexius_os.roles(time_to_value);
create index if not exists idx_role_functions_role on nexius_os.role_functions(role_id);
create index if not exists idx_role_outcomes_role on nexius_os.role_outcomes(role_id);
create index if not exists idx_leads_email on nexius_os.leads(email);
create index if not exists idx_leads_created_at on nexius_os.leads(created_at desc);
create index if not exists idx_interview_sessions_role on nexius_os.interview_sessions(role_id);

insert into nexius_os.workflows (code, name, sort_order) values
  ('CRM', 'CRM', 1),
  ('ERP', 'ERP', 2),
  ('Finance', 'Finance', 3),
  ('HRMS', 'HRMS', 4)
on conflict (code) do nothing;

insert into nexius_os.systems (code, name) values
  ('ATS','ATS'),('CRM','CRM'),('ERP','ERP'),('Finance','Finance'),('HRMS','HRMS'),('ITSM','ITSM'),('MAP','MAP'),('WMS','WMS')
on conflict (code) do nothing;
