-- Airwallex subscriptions (Nexius OS)

do $$ begin
  create type nexius_os.subscription_status_t as enum (
    'initiated',
    'active',
    'past_due',
    'cancelled',
    'failed'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists nexius_os.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role_ids text[] not null default array[]::text[],
  currency text not null default 'SGD',
  monthly_amount int not null default 0,
  status nexius_os.subscription_status_t not null default 'initiated',
  billing_starts_at timestamptz,

  provider text default 'airwallex',
  provider_customer_id text,
  provider_subscription_id text,
  provider_checkout_id text,
  provider_price_id text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_subscriptions_user on nexius_os.subscriptions(user_id);
create index if not exists idx_subscriptions_status on nexius_os.subscriptions(status);
create index if not exists idx_subscriptions_created_at on nexius_os.subscriptions(created_at desc);

create table if not exists nexius_os.subscription_events (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references nexius_os.subscriptions(id) on delete cascade,
  provider_event_id text,
  event_type text,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  unique (provider_event_id)
);

create index if not exists idx_subscription_events_sub on nexius_os.subscription_events(subscription_id);
create index if not exists idx_subscription_events_created_at on nexius_os.subscription_events(created_at desc);
