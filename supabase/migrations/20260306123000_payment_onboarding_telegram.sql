-- Add Telegram onboarding details capture after payment

create table if not exists nexius_os.payment_onboarding (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  telegram_username text not null,
  telegram_bot_token text not null,
  role_ids text[] default '{}'::text[],
  currency text default 'SGD',
  monthly_total numeric,
  source_page text,
  created_at timestamptz default now()
);

create index if not exists idx_payment_onboarding_created_at on nexius_os.payment_onboarding(created_at desc);
