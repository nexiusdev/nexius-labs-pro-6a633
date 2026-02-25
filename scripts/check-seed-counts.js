const { Client } = require('pg');

(async () => {
  const c = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
  });
  await c.connect();
  const q = await c.query(`
    select 'roles' t,count(*) c from nexius_os.roles
    union all select 'role_functions',count(*) from nexius_os.role_functions
    union all select 'role_function_skills',count(*) from nexius_os.role_function_skills
    union all select 'skills',count(*) from nexius_os.skills
    union all select 'role_outcomes',count(*) from nexius_os.role_outcomes
    union all select 'tags',count(*) from nexius_os.tags
    union all select 'role_tag_map',count(*) from nexius_os.role_tag_map
    union all select 'role_system_map',count(*) from nexius_os.role_system_map
    union all select 'experts',count(*) from nexius_os.experts
    union all select 'expert_expertise',count(*) from nexius_os.expert_expertise
    union all select 'expert_experience',count(*) from nexius_os.expert_experience
    union all select 'expert_education',count(*) from nexius_os.expert_education
    union all select 'expert_certifications',count(*) from nexius_os.expert_certifications
    union all select 'expert_role_map',count(*) from nexius_os.expert_role_map
    union all select 'workflows',count(*) from nexius_os.workflows
    union all select 'systems',count(*) from nexius_os.systems
  `);
  console.table(q.rows);
  await c.end();
})();
