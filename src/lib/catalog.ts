import { db } from "@/lib/db";
import type { Role, RoleFunction, RoleOutcome } from "@/data/roles";
import type { Expert, ExperienceItem, EducationItem } from "@/data/experts";

export async function getAllRolesDb(): Promise<Role[]> {
  const rolesRes = await db.query(`select * from nexius_os.roles where is_active=true order by title asc`);
  const functionsRes = await db.query(`select id, role_id, name, automation_percent, sort_order from nexius_os.role_functions order by role_id, sort_order asc`);
  const outcomesRes = await db.query(`select role_id, value, label, description, sort_order from nexius_os.role_outcomes order by role_id, sort_order asc`);
  const tagsRes = await db.query(`select rtm.role_id, t.name from nexius_os.role_tag_map rtm join nexius_os.tags t on t.id = rtm.tag_id order by rtm.role_id, t.name`);
  const systemsRes = await db.query(`select rsm.role_id, s.code from nexius_os.role_system_map rsm join nexius_os.systems s on s.id = rsm.system_id order by rsm.role_id, s.code`);
  const rfSkillsRes = await db.query(`select rf.role_id, rf.id as role_function_id, sk.name, rfs.sort_order from nexius_os.role_function_skills rfs join nexius_os.role_functions rf on rf.id = rfs.role_function_id join nexius_os.skills sk on sk.id = rfs.skill_id order by rf.role_id, rf.sort_order, rfs.sort_order`);

  const functionSkills = new Map<string, string[]>();
  for (const row of rfSkillsRes.rows) {
    const arr = functionSkills.get(row.role_function_id) ?? [];
    arr.push(row.name);
    functionSkills.set(row.role_function_id, arr);
  }

  const roleFunctions = new Map<string, RoleFunction[]>();
  for (const row of functionsRes.rows) {
    const arr = roleFunctions.get(row.role_id) ?? [];
    arr.push({ name: row.name, automationPercent: row.automation_percent, skills: functionSkills.get(row.id) ?? [] });
    roleFunctions.set(row.role_id, arr);
  }

  const roleOutcomes = new Map<string, RoleOutcome[]>();
  for (const row of outcomesRes.rows) {
    const arr = roleOutcomes.get(row.role_id) ?? [];
    arr.push({ value: row.value, label: row.label, description: row.description ?? "" });
    roleOutcomes.set(row.role_id, arr);
  }

  const roleTags = new Map<string, string[]>();
  for (const row of tagsRes.rows) {
    const arr = roleTags.get(row.role_id) ?? [];
    arr.push(row.name);
    roleTags.set(row.role_id, arr);
  }

  const roleSystems = new Map<string, string[]>();
  for (const row of systemsRes.rows) {
    const arr = roleSystems.get(row.role_id) ?? [];
    arr.push(row.code);
    roleSystems.set(row.role_id, arr);
  }

  return rolesRes.rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    detailedDescription: r.detailed_description ?? r.description,
    tags: roleTags.get(r.id) ?? [],
    kpi: r.kpi ?? "",
    workflow: r.workflow_code,
    functionCount: r.function_count ?? (roleFunctions.get(r.id)?.length ?? 0),
    functions: roleFunctions.get(r.id) ?? [],
    outcomes: roleOutcomes.get(r.id) ?? [],
    governance: r.governance,
    complexity: r.complexity,
    timeToValue: r.time_to_value,
    outcomeCategory: r.outcome_category,
    systems: roleSystems.get(r.id) ?? [],
    image: r.image_url ?? "",
  })) as Role[];
}

export async function getRoleByIdDb(id: string): Promise<Role | undefined> {
  const roles = await getAllRolesDb();
  return roles.find((r) => r.id === id);
}

export async function getAllExpertsDb(): Promise<Expert[]> {
  const expertsRes = await db.query(`select * from nexius_os.experts where is_active=true order by name asc`);
  const expertiseRes = await db.query(`select expert_id, expertise, sort_order from nexius_os.expert_expertise order by expert_id, sort_order`);
  const expRes = await db.query(`select expert_id, role_title, company, period_text, description, sort_order from nexius_os.expert_experience order by expert_id, sort_order`);
  const eduRes = await db.query(`select expert_id, degree, institution, year, sort_order from nexius_os.expert_education order by expert_id, sort_order`);
  const certRes = await db.query(`select expert_id, certification, sort_order from nexius_os.expert_certifications order by expert_id, sort_order`);
  const roleMapRes = await db.query(`select expert_id, role_id from nexius_os.expert_role_map order by expert_id`);

  const exps = new Map<string, string[]>();
  for (const row of expertiseRes.rows) {
    const arr = exps.get(row.expert_id) ?? [];
    arr.push(row.expertise);
    exps.set(row.expert_id, arr);
  }

  const experiences = new Map<string, ExperienceItem[]>();
  for (const row of expRes.rows) {
    const arr = experiences.get(row.expert_id) ?? [];
    arr.push({ role: row.role_title, company: row.company, period: row.period_text, description: row.description });
    experiences.set(row.expert_id, arr);
  }

  const education = new Map<string, EducationItem[]>();
  for (const row of eduRes.rows) {
    const arr = education.get(row.expert_id) ?? [];
    arr.push({ degree: row.degree, institution: row.institution, year: row.year });
    education.set(row.expert_id, arr);
  }

  const certs = new Map<string, string[]>();
  for (const row of certRes.rows) {
    const arr = certs.get(row.expert_id) ?? [];
    arr.push(row.certification);
    certs.set(row.expert_id, arr);
  }

  const roleIds = new Map<string, string[]>();
  for (const row of roleMapRes.rows) {
    const arr = roleIds.get(row.expert_id) ?? [];
    arr.push(row.role_id);
    roleIds.set(row.expert_id, arr);
  }

  return expertsRes.rows.map((e) => ({
    id: e.id,
    name: e.name,
    title: e.title,
    location: e.location,
    image: e.image_url ?? "",
    about: e.about ?? "",
    headline: e.headline ?? "",
    expertise: exps.get(e.id) ?? [],
    experience: experiences.get(e.id) ?? [],
    education: education.get(e.id) ?? [],
    certifications: certs.get(e.id) ?? [],
    roleIds: roleIds.get(e.id) ?? [],
  })) as Expert[];
}

export async function getExpertByIdDb(id: string): Promise<Expert | undefined> {
  const experts = await getAllExpertsDb();
  return experts.find((e) => e.id === id);
}

export async function getExpertByRoleMapDb(): Promise<Record<string, Expert>> {
  const experts = await getAllExpertsDb();
  const map: Record<string, Expert> = {};
  for (const e of experts) {
    for (const roleId of e.roleIds) {
      map[roleId] = e;
    }
  }
  return map;
}
