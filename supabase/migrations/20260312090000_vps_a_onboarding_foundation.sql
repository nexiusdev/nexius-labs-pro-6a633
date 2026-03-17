create table if not exists nexius_os.customer_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  customer_id text not null,
  subscription_id uuid not null references nexius_os.subscriptions(id) on delete cascade,
  role_id text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (subscription_id, role_id)
);

create index if not exists idx_customer_entitlements_user on nexius_os.customer_entitlements(user_id);
create index if not exists idx_customer_entitlements_customer on nexius_os.customer_entitlements(customer_id);

create table if not exists nexius_os.telegram_bot_pool (
  id uuid primary key default gen_random_uuid(),
  bot_username text not null unique,
  token_secret_ref text,
  encrypted_token text,
  status text not null default 'active',
  assigned_count integer not null default 0,
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint telegram_bot_pool_token_source_chk check (
    token_secret_ref is not null or encrypted_token is not null
  )
);

create index if not exists idx_telegram_bot_pool_status on nexius_os.telegram_bot_pool(status);

create table if not exists nexius_os.customer_bot_assignments (
  id uuid primary key default gen_random_uuid(),
  customer_id text not null,
  bot_pool_id uuid not null references nexius_os.telegram_bot_pool(id) on delete restrict,
  assignment_status text not null default 'assigned',
  assigned_at timestamptz not null default now(),
  released_at timestamptz,
  unique (customer_id)
);

create index if not exists idx_customer_bot_assignments_bot on nexius_os.customer_bot_assignments(bot_pool_id);

create table if not exists nexius_os.onboarding_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  subscription_id uuid not null references nexius_os.subscriptions(id) on delete cascade,
  customer_id text not null,
  idempotency_key text not null unique,
  request_id text not null unique,
  state text not null default 'queued',
  payload jsonb not null default '{}'::jsonb,
  result jsonb not null default '{}'::jsonb,
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_onboarding_jobs_user on nexius_os.onboarding_jobs(user_id);
create index if not exists idx_onboarding_jobs_subscription on nexius_os.onboarding_jobs(subscription_id);
create index if not exists idx_onboarding_jobs_customer on nexius_os.onboarding_jobs(customer_id);
create index if not exists idx_onboarding_jobs_state on nexius_os.onboarding_jobs(state);

alter table nexius_os.customer_entitlements enable row level security;
alter table nexius_os.telegram_bot_pool enable row level security;
alter table nexius_os.customer_bot_assignments enable row level security;
alter table nexius_os.onboarding_jobs enable row level security;

create policy customer_entitlements_service_only
  on nexius_os.customer_entitlements
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy telegram_bot_pool_service_only
  on nexius_os.telegram_bot_pool
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy customer_bot_assignments_service_only
  on nexius_os.customer_bot_assignments
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy onboarding_jobs_service_only
  on nexius_os.onboarding_jobs
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

