create table if not exists nexius_os.admin_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  status text not null default 'active',
  role text not null default 'super_admin',
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by text,
  updated_by text
);

create table if not exists nexius_os.admin_sessions (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references nexius_os.admin_users(id) on delete cascade,
  session_token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz,
  ip_address text,
  user_agent text
);

create table if not exists nexius_os.admin_auth_audit (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references nexius_os.admin_users(id) on delete set null,
  username text,
  event_type text not null,
  success boolean not null default false,
  ip_address text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_users_status on nexius_os.admin_users(status);
create index if not exists idx_admin_sessions_admin_user on nexius_os.admin_sessions(admin_user_id);
create index if not exists idx_admin_sessions_expires on nexius_os.admin_sessions(expires_at);
create index if not exists idx_admin_auth_audit_admin_user on nexius_os.admin_auth_audit(admin_user_id, created_at desc);

alter table nexius_os.admin_users enable row level security;
alter table nexius_os.admin_sessions enable row level security;
alter table nexius_os.admin_auth_audit enable row level security;

create policy admin_users_service_only
  on nexius_os.admin_users
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy admin_sessions_service_only
  on nexius_os.admin_sessions
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy admin_auth_audit_service_only
  on nexius_os.admin_auth_audit
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
