const { Client } = require('pg');

(async () => {
  const c = new Client({ connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' });
  await c.connect();
  await c.query(`
    grant usage on schema nexius_os to anon, authenticated, service_role;
    grant all privileges on all tables in schema nexius_os to anon, authenticated, service_role;
    grant all privileges on all sequences in schema nexius_os to anon, authenticated, service_role;
    alter default privileges in schema nexius_os grant all on tables to anon, authenticated, service_role;
    alter default privileges in schema nexius_os grant all on sequences to anon, authenticated, service_role;
  `);
  console.log('grants ok');
  await c.end();
})();
