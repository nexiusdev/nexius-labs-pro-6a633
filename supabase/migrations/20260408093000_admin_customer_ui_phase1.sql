create table if not exists nexius_os.portal_audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  customer_id text,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by text
);

create index if not exists idx_portal_audit_events_user_created
  on nexius_os.portal_audit_events(user_id, created_at desc);

create index if not exists idx_portal_audit_events_customer_created
  on nexius_os.portal_audit_events(customer_id, created_at desc);

alter table nexius_os.portal_audit_events enable row level security;

create policy portal_audit_events_service_only
  on nexius_os.portal_audit_events
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
