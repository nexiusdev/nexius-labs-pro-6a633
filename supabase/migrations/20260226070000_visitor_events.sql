create table if not exists nexius_os.visitor_events (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  event_type text not null,
  role_id text null,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_visitor_events_visitor on nexius_os.visitor_events(visitor_id);
create index if not exists idx_visitor_events_type on nexius_os.visitor_events(event_type);
create index if not exists idx_visitor_events_created on nexius_os.visitor_events(created_at desc);

grant all privileges on table nexius_os.visitor_events to anon, authenticated, service_role;
