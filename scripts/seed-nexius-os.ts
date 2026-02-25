import { Client } from "pg";
import { roles } from "../src/data/roles";
import { experts } from "../src/data/experts";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

async function main() {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query("begin");

    // Clear child -> parent
    await client.query(`
      truncate table
        nexius_os.expert_role_map,
        nexius_os.expert_certifications,
        nexius_os.expert_education,
        nexius_os.expert_experience,
        nexius_os.expert_expertise,
        nexius_os.experts,
        nexius_os.role_system_map,
        nexius_os.role_tag_map,
        nexius_os.tags,
        nexius_os.role_outcomes,
        nexius_os.role_function_skills,
        nexius_os.skills,
        nexius_os.role_functions,
        nexius_os.roles
      restart identity cascade;
    `);

    for (const role of roles) {
      await client.query(
        `insert into nexius_os.roles
          (id, title, description, detailed_description, workflow_code, kpi, governance, complexity, time_to_value, outcome_category, image_url, function_count, is_active)
         values
          ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,true)`,
        [
          role.id,
          role.title,
          role.description,
          role.detailedDescription,
          role.workflow,
          role.kpi,
          role.governance,
          role.complexity,
          role.timeToValue,
          role.outcomeCategory,
          role.image,
          role.functionCount,
        ]
      );

      for (let i = 0; i < role.tags.length; i++) {
        const tag = role.tags[i];
        const tagRes = await client.query(
          `insert into nexius_os.tags(name) values($1)
           on conflict(name) do update set name = excluded.name
           returning id`,
          [tag]
        );
        const tagId = tagRes.rows[0].id;
        await client.query(
          `insert into nexius_os.role_tag_map(role_id, tag_id)
           values($1,$2)
           on conflict do nothing`,
          [role.id, tagId]
        );
      }

      for (const systemCode of role.systems) {
        const sysRes = await client.query(`select id from nexius_os.systems where code = $1`, [systemCode]);
        if (sysRes.rowCount > 0) {
          await client.query(
            `insert into nexius_os.role_system_map(role_id, system_id)
             values($1,$2)
             on conflict do nothing`,
            [role.id, sysRes.rows[0].id]
          );
        }
      }

      for (let i = 0; i < role.functions.length; i++) {
        const fn = role.functions[i];
        const fnRes = await client.query(
          `insert into nexius_os.role_functions(role_id, name, automation_percent, sort_order)
           values($1,$2,$3,$4)
           returning id`,
          [role.id, fn.name, fn.automationPercent, i + 1]
        );
        const fnId = fnRes.rows[0].id;

        for (let s = 0; s < fn.skills.length; s++) {
          const skillName = fn.skills[s];
          const skillRes = await client.query(
            `insert into nexius_os.skills(name) values($1)
             on conflict(name) do update set name = excluded.name
             returning id`,
            [skillName]
          );
          const skillId = skillRes.rows[0].id;

          await client.query(
            `insert into nexius_os.role_function_skills(role_function_id, skill_id, sort_order)
             values($1,$2,$3)
             on conflict do nothing`,
            [fnId, skillId, s + 1]
          );
        }
      }

      for (let i = 0; i < role.outcomes.length; i++) {
        const out = role.outcomes[i];
        await client.query(
          `insert into nexius_os.role_outcomes(role_id, value, label, description, sort_order)
           values($1,$2,$3,$4,$5)`,
          [role.id, out.value, out.label, out.description, i + 1]
        );
      }
    }

    for (const expert of experts) {
      await client.query(
        `insert into nexius_os.experts
          (id, name, title, location, image_url, about, headline, is_active)
         values ($1,$2,$3,$4,$5,$6,$7,true)`,
        [expert.id, expert.name, expert.title, expert.location, expert.image, expert.about, expert.headline]
      );

      for (let i = 0; i < expert.expertise.length; i++) {
        await client.query(
          `insert into nexius_os.expert_expertise(expert_id, expertise, sort_order)
           values($1,$2,$3)`,
          [expert.id, expert.expertise[i], i + 1]
        );
      }

      for (let i = 0; i < expert.experience.length; i++) {
        const exp = expert.experience[i];
        await client.query(
          `insert into nexius_os.expert_experience(expert_id, role_title, company, period_text, description, sort_order)
           values($1,$2,$3,$4,$5,$6)`,
          [expert.id, exp.role, exp.company, exp.period, exp.description, i + 1]
        );
      }

      for (let i = 0; i < expert.education.length; i++) {
        const edu = expert.education[i];
        await client.query(
          `insert into nexius_os.expert_education(expert_id, degree, institution, year, sort_order)
           values($1,$2,$3,$4,$5)`,
          [expert.id, edu.degree, edu.institution, edu.year, i + 1]
        );
      }

      for (let i = 0; i < expert.certifications.length; i++) {
        await client.query(
          `insert into nexius_os.expert_certifications(expert_id, certification, sort_order)
           values($1,$2,$3)`,
          [expert.id, expert.certifications[i], i + 1]
        );
      }

      for (const roleId of expert.roleIds) {
        await client.query(
          `insert into nexius_os.expert_role_map(expert_id, role_id)
           values($1,$2)
           on conflict do nothing`,
          [expert.id, roleId]
        );
      }
    }

    await client.query("commit");

    const counts = await client.query(`
      select
        (select count(*) from nexius_os.roles) as roles,
        (select count(*) from nexius_os.role_functions) as role_functions,
        (select count(*) from nexius_os.skills) as skills,
        (select count(*) from nexius_os.role_outcomes) as role_outcomes,
        (select count(*) from nexius_os.tags) as tags,
        (select count(*) from nexius_os.experts) as experts;
    `);

    console.log("Seed complete:", counts.rows[0]);
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
