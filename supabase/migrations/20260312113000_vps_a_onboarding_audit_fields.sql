alter table nexius_os.customer_entitlements
  add column if not exists created_by text,
  add column if not exists updated_by text,
  add column if not exists last_action text,
  add column if not exists last_action_at timestamptz;

alter table nexius_os.telegram_bot_pool
  add column if not exists created_by text,
  add column if not exists updated_by text,
  add column if not exists last_action text,
  add column if not exists last_action_at timestamptz;

alter table nexius_os.customer_bot_assignments
  add column if not exists created_by text,
  add column if not exists updated_by text,
  add column if not exists last_action text,
  add column if not exists last_action_at timestamptz;

alter table nexius_os.onboarding_jobs
  add column if not exists created_by text,
  add column if not exists updated_by text,
  add column if not exists last_action text,
  add column if not exists last_action_at timestamptz;
