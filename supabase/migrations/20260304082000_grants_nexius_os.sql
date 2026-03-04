-- Grants for local/dev: allow API roles to access nexius_os schema
-- NOTE: tighten for production; prefer least-privilege + RLS policies.

grant usage on schema nexius_os to anon, authenticated, service_role;

grant all privileges on all tables in schema nexius_os to anon, authenticated, service_role;
grant all privileges on all sequences in schema nexius_os to anon, authenticated, service_role;

-- Ensure future tables/sequences also get privileges
alter default privileges in schema nexius_os grant all on tables to anon, authenticated, service_role;
alter default privileges in schema nexius_os grant all on sequences to anon, authenticated, service_role;
