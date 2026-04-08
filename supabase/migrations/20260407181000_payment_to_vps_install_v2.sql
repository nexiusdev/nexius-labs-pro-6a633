-- PRD V2: payment -> fulfillment dispatch foundation

create table if not exists nexius_os.sku_registry (
  id uuid primary key default gen_random_uuid(),
  sku_code text not null unique,
  package_id text not null,
  role_ids text[] not null default array[]::text[],
  package_version text not null,
  contract_version text not null default 'v2',
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_sku_registry_active on nexius_os.sku_registry(active);

create table if not exists nexius_os.customer_tenant_mappings (
  id uuid primary key default gen_random_uuid(),
  customer_id text not null unique,
  tenant_id text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by text,
  updated_by text,
  last_action text,
  last_action_at timestamptz
);

create index if not exists idx_customer_tenant_mappings_tenant on nexius_os.customer_tenant_mappings(tenant_id);
create index if not exists idx_customer_tenant_mappings_status on nexius_os.customer_tenant_mappings(status);

create table if not exists nexius_os.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'airwallex',
  provider_event_id text not null,
  provider_payment_id text,
  provider_session_id text,
  provider_subscription_id text,
  subscription_id uuid references nexius_os.subscriptions(id) on delete set null,
  idempotency_key text not null,
  status text not null default 'received',
  error_code text,
  error_message text,
  payload jsonb not null default '{}'::jsonb,
  retry_count integer not null default 0,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

create unique index if not exists ux_payment_events_provider_idempotency
  on nexius_os.payment_events(provider, idempotency_key);
create index if not exists idx_payment_events_status on nexius_os.payment_events(status);
create index if not exists idx_payment_events_subscription on nexius_os.payment_events(subscription_id);
create index if not exists idx_payment_events_received_at on nexius_os.payment_events(received_at desc);

create table if not exists nexius_os.onboarding_job_events (
  id uuid primary key default gen_random_uuid(),
  onboarding_job_id uuid not null references nexius_os.onboarding_jobs(id) on delete cascade,
  state text not null,
  stage text,
  detail jsonb not null default '{}'::jsonb,
  actor text,
  created_at timestamptz not null default now()
);

create index if not exists idx_onboarding_job_events_job on nexius_os.onboarding_job_events(onboarding_job_id, created_at desc);

alter table nexius_os.subscriptions
  add column if not exists sku_codes text[] not null default array[]::text[],
  add column if not exists package_ids text[] not null default array[]::text[],
  add column if not exists package_versions text[] not null default array[]::text[],
  add column if not exists purchase_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists contract_version text not null default 'v2',
  add column if not exists tenant_profile text not null default 'runtime_plus_ui_supabase';

alter table nexius_os.customer_entitlements
  add column if not exists package_id text,
  add column if not exists package_version text,
  add column if not exists contract_version text not null default 'v2',
  add column if not exists entitlement_snapshot jsonb not null default '{}'::jsonb;

alter table nexius_os.onboarding_jobs
  add column if not exists contract_version text not null default 'v2',
  add column if not exists tenant_profile text not null default 'runtime_plus_ui_supabase',
  add column if not exists sku_codes text[] not null default array[]::text[],
  add column if not exists package_ids text[] not null default array[]::text[],
  add column if not exists package_versions text[] not null default array[]::text[],
  add column if not exists provision_mode text,
  add column if not exists request_payload jsonb not null default '{}'::jsonb,
  add column if not exists response_payload jsonb not null default '{}'::jsonb,
  add column if not exists retry_count integer not null default 0,
  add column if not exists next_retry_at timestamptz,
  add column if not exists error_stage text,
  add column if not exists correlation_id text,
  add column if not exists payment_event_id uuid references nexius_os.payment_events(id) on delete set null;

create index if not exists idx_onboarding_jobs_next_retry on nexius_os.onboarding_jobs(next_retry_at);
create index if not exists idx_onboarding_jobs_error_stage on nexius_os.onboarding_jobs(error_stage);
create index if not exists idx_onboarding_jobs_payment_event on nexius_os.onboarding_jobs(payment_event_id);

-- Backfill defaults for active subscriptions missing v2 snapshots.
update nexius_os.subscriptions
set
  contract_version = coalesce(nullif(contract_version, ''), 'v2'),
  tenant_profile = coalesce(nullif(tenant_profile, ''), 'runtime_plus_ui_supabase'),
  purchase_snapshot = case
    when purchase_snapshot = '{}'::jsonb then
      jsonb_build_object(
        'contractVersion', 'v2',
        'tenantProfile', 'runtime_plus_ui_supabase',
        'roleIds', coalesce(role_ids, array[]::text[]),
        'skuCodes', coalesce(sku_codes, array[]::text[]),
        'packageIds', coalesce(package_ids, array[]::text[]),
        'packageVersions', coalesce(package_versions, array[]::text[]),
        'capturedAt', now()
      )
    else purchase_snapshot
  end
where status = 'active';

update nexius_os.onboarding_jobs
set state = 'payment_confirmed'
where state = 'queued';

alter table nexius_os.sku_registry enable row level security;
alter table nexius_os.customer_tenant_mappings enable row level security;
alter table nexius_os.payment_events enable row level security;
alter table nexius_os.onboarding_job_events enable row level security;

create policy sku_registry_service_only
  on nexius_os.sku_registry
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy customer_tenant_mappings_service_only
  on nexius_os.customer_tenant_mappings
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy payment_events_service_only
  on nexius_os.payment_events
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy onboarding_job_events_service_only
  on nexius_os.onboarding_job_events
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
