import type { Role, RoleFunction, RoleOutcome } from "@/data/roles";
import type { Expert, ExperienceItem, EducationItem } from "@/data/experts";
import { supabaseAdmin } from "@/lib/supabase-admin";

const db = supabaseAdmin.schema("nexius_os");

export async function getAllRolesDb(): Promise<Role[]> {
  const [{ data: roles }, { data: functions }, { data: outcomes }, { data: tagMap }, { data: systemMap }, { data: rfSkills }] =
    await Promise.all([
      db.from("roles").select("*").eq("is_active", true).order("title", { ascending: true }),
      db.from("role_functions").select("id,role_id,name,automation_percent,sort_order").order("sort_order", { ascending: true }),
      db.from("role_outcomes").select("role_id,value,label,description,sort_order").order("sort_order", { ascending: true }),
      db.from("role_tag_map").select("role_id,tags(name)"),
      db.from("role_system_map").select("role_id,systems(code)"),
      db.from("role_function_skills").select("role_function_id,sort_order,skills(name)").order("sort_order", { ascending: true }),
    ]);

  const skillMap = new Map<string, string[]>();
  for (const row of rfSkills ?? []) {
    const key = row.role_function_id as string;
    const arr = skillMap.get(key) ?? [];
    const name = (row.skills as { name?: string } | null)?.name;
    if (name) arr.push(name);
    skillMap.set(key, arr);
  }

  const fnMap = new Map<string, RoleFunction[]>();
  for (const row of functions ?? []) {
    const roleId = row.role_id as string;
    const arr = fnMap.get(roleId) ?? [];
    arr.push({
      name: row.name as string,
      automationPercent: Number(row.automation_percent),
      skills: skillMap.get(row.id as string) ?? [],
    });
    fnMap.set(roleId, arr);
  }

  const outcomeMap = new Map<string, RoleOutcome[]>();
  for (const row of outcomes ?? []) {
    const roleId = row.role_id as string;
    const arr = outcomeMap.get(roleId) ?? [];
    arr.push({ value: row.value as string, label: row.label as string, description: (row.description as string) ?? "" });
    outcomeMap.set(roleId, arr);
  }

  const tags = new Map<string, string[]>();
  for (const row of tagMap ?? []) {
    const roleId = row.role_id as string;
    const arr = tags.get(roleId) ?? [];
    const name = (row.tags as { name?: string } | null)?.name;
    if (name) arr.push(name);
    tags.set(roleId, arr);
  }

  const systems = new Map<string, string[]>();
  for (const row of systemMap ?? []) {
    const roleId = row.role_id as string;
    const arr = systems.get(roleId) ?? [];
    const code = (row.systems as { code?: string } | null)?.code;
    if (code) arr.push(code);
    systems.set(roleId, arr);
  }

  return (roles ?? []).map((r) => ({
    id: r.id as string,
    title: r.title as string,
    description: r.description as string,
    detailedDescription: (r.detailed_description as string) ?? (r.description as string),
    tags: tags.get(r.id as string) ?? [],
    kpi: (r.kpi as string) ?? "",
    workflow: r.workflow_code as Role["workflow"],
    functionCount: Number(r.function_count ?? (fnMap.get(r.id as string)?.length ?? 0)),
    functions: fnMap.get(r.id as string) ?? [],
    outcomes: outcomeMap.get(r.id as string) ?? [],
    governance: r.governance as Role["governance"],
    complexity: r.complexity as Role["complexity"],
    timeToValue: r.time_to_value as Role["timeToValue"],
    outcomeCategory: r.outcome_category as Role["outcomeCategory"],
    systems: systems.get(r.id as string) as Role["systems"],
    image: (r.image_url as string) ?? "",
  }));
}

export async function getRoleByIdDb(id: string): Promise<Role | undefined> {
  const roles = await getAllRolesDb();
  return roles.find((r) => r.id === id);
}

export async function getAllExpertsDb(): Promise<Expert[]> {
  const [{ data: experts }, { data: expertise }, { data: exp }, { data: edu }, { data: certs }, { data: roleMap }] =
    await Promise.all([
      db.from("experts").select("*").eq("is_active", true).order("name", { ascending: true }),
      db.from("expert_expertise").select("expert_id,expertise,sort_order").order("sort_order", { ascending: true }),
      db.from("expert_experience").select("expert_id,role_title,company,period_text,description,sort_order").order("sort_order", { ascending: true }),
      db.from("expert_education").select("expert_id,degree,institution,year,sort_order").order("sort_order", { ascending: true }),
      db.from("expert_certifications").select("expert_id,certification,sort_order").order("sort_order", { ascending: true }),
      db.from("expert_role_map").select("expert_id,role_id"),
    ]);

  const exps = new Map<string, string[]>();
  for (const row of expertise ?? []) {
    const id = row.expert_id as string;
    const arr = exps.get(id) ?? [];
    arr.push(row.expertise as string);
    exps.set(id, arr);
  }

  const experiences = new Map<string, ExperienceItem[]>();
  for (const row of exp ?? []) {
    const id = row.expert_id as string;
    const arr = experiences.get(id) ?? [];
    arr.push({ role: row.role_title as string, company: row.company as string, period: row.period_text as string, description: row.description as string });
    experiences.set(id, arr);
  }

  const education = new Map<string, EducationItem[]>();
  for (const row of edu ?? []) {
    const id = row.expert_id as string;
    const arr = education.get(id) ?? [];
    arr.push({ degree: row.degree as string, institution: row.institution as string, year: row.year as string });
    education.set(id, arr);
  }

  const certifications = new Map<string, string[]>();
  for (const row of certs ?? []) {
    const id = row.expert_id as string;
    const arr = certifications.get(id) ?? [];
    arr.push(row.certification as string);
    certifications.set(id, arr);
  }

  const roleIds = new Map<string, string[]>();
  for (const row of roleMap ?? []) {
    const id = row.expert_id as string;
    const arr = roleIds.get(id) ?? [];
    arr.push(row.role_id as string);
    roleIds.set(id, arr);
  }

  return (experts ?? []).map((e) => ({
    id: e.id as string,
    name: e.name as string,
    title: e.title as string,
    location: (e.location as string) ?? "",
    image: (e.image_url as string) ?? "",
    about: (e.about as string) ?? "",
    headline: (e.headline as string) ?? "",
    expertise: exps.get(e.id as string) ?? [],
    experience: experiences.get(e.id as string) ?? [],
    education: education.get(e.id as string) ?? [],
    certifications: certifications.get(e.id as string) ?? [],
    roleIds: roleIds.get(e.id as string) ?? [],
  }));
}

export async function getExpertByIdDb(id: string): Promise<Expert | undefined> {
  const experts = await getAllExpertsDb();
  return experts.find((e) => e.id === id);
}

export async function getExpertByRoleMapDb(): Promise<Record<string, Expert>> {
  const experts = await getAllExpertsDb();
  const map: Record<string, Expert> = {};
  for (const e of experts) {
    for (const roleId of e.roleIds) map[roleId] = e;
  }
  return map;
}
