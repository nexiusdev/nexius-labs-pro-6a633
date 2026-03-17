import { createClient } from "@supabase/supabase-js";
import pg from "pg";

const { Client } = pg;

function reqEnv(name: string) {
  const v = (process.env[name] || "").trim();
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

function cleanKey(v: string) {
  // Remove quotes and any whitespace/newlines that may have been pasted.
  return v.replace(/^['\"]|['\"]$/g, "").replace(/[\s\r\n]+/g, "");
}

type PkInfo = { columns: string[] };

type TableInfo = {
  name: string;
  pk: PkInfo | null;
  columns: string[];
  deps: string[]; // referenced tables in same schema
};

async function getTables(client: pg.Client, schema: string): Promise<TableInfo[]> {
  const tablesRes = await client.query<{ table_name: string }>(
    `select table_name
     from information_schema.tables
     where table_schema = $1 and table_type = 'BASE TABLE'
     order by table_name`,
    [schema]
  );

  const tableNames = tablesRes.rows.map((r) => r.table_name);

  // Columns
  const colsRes = await client.query<{ table_name: string; column_name: string }>(
    `select table_name, column_name
     from information_schema.columns
     where table_schema = $1
     order by table_name, ordinal_position`,
    [schema]
  );
  const colMap = new Map<string, string[]>();
  for (const r of colsRes.rows) {
    const arr = colMap.get(r.table_name) ?? [];
    arr.push(r.column_name);
    colMap.set(r.table_name, arr);
  }

  // Primary keys
  const pkRes = await client.query<{ table_name: string; column_name: string; ordinal_position: number }>(
    `select tc.table_name, kcu.column_name, kcu.ordinal_position
     from information_schema.table_constraints tc
     join information_schema.key_column_usage kcu
       on tc.constraint_name = kcu.constraint_name
      and tc.table_schema = kcu.table_schema
     where tc.table_schema = $1
       and tc.constraint_type = 'PRIMARY KEY'
     order by tc.table_name, kcu.ordinal_position`,
    [schema]
  );
  const pkMap = new Map<string, string[]>();
  for (const r of pkRes.rows) {
    const arr = pkMap.get(r.table_name) ?? [];
    arr.push(r.column_name);
    pkMap.set(r.table_name, arr);
  }

  // Foreign key dependencies within same schema
  const fkRes = await client.query<{ table_name: string; referenced_table_name: string }>(
    `select
        tc.table_name,
        ccu.table_name as referenced_table_name
     from information_schema.table_constraints tc
     join information_schema.constraint_column_usage ccu
       on ccu.constraint_name = tc.constraint_name
      and ccu.table_schema = tc.table_schema
     where tc.table_schema = $1
       and tc.constraint_type = 'FOREIGN KEY'
       and ccu.table_schema = $1`,
    [schema]
  );
  const depMap = new Map<string, Set<string>>();
  for (const r of fkRes.rows) {
    if (r.table_name === r.referenced_table_name) continue;
    const s = depMap.get(r.table_name) ?? new Set<string>();
    s.add(r.referenced_table_name);
    depMap.set(r.table_name, s);
  }

  return tableNames.map((name) => ({
    name,
    pk: pkMap.get(name)?.length ? { columns: pkMap.get(name)! } : null,
    columns: colMap.get(name) ?? [],
    deps: Array.from(depMap.get(name) ?? new Set<string>()).sort(),
  }));
}

function topoSortTables(tables: TableInfo[]): TableInfo[] {
  const byName = new Map(tables.map((t) => [t.name, t] as const));
  const remaining = new Set(tables.map((t) => t.name));
  const done = new Set<string>();
  const out: TableInfo[] = [];

  while (remaining.size) {
    let progressed = false;
    for (const name of Array.from(remaining).sort()) {
      const t = byName.get(name)!;
      const unmet = t.deps.filter((d) => remaining.has(d) && !done.has(d));
      if (unmet.length === 0) {
        out.push(t);
        remaining.delete(name);
        done.add(name);
        progressed = true;
      }
    }
    if (!progressed) {
      // Cycle or missing deps; append the rest in deterministic order.
      for (const name of Array.from(remaining).sort()) {
        out.push(byName.get(name)!);
      }
      break;
    }
  }
  return out;
}

function quoteIdent(id: string) {
  return `"${id.replace(/"/g, '""')}"`;
}

async function upsertBatch(params: {
  client: pg.Client;
  schema: string;
  table: TableInfo;
  rows: Record<string, any>[];
}) {
  const { client, schema, table, rows } = params;
  if (rows.length === 0) return;

  const cols = table.columns;
  if (cols.length === 0) return;

  // Only include columns present in row objects
  const presentCols = cols.filter((c) => rows.some((r) => Object.prototype.hasOwnProperty.call(r, c)));
  if (presentCols.length === 0) return;

  const colListSql = presentCols.map(quoteIdent).join(",");

  // Build values + params
  const values: any[] = [];
  const rowsSql = rows
    .map((r, i) => {
      const base = i * presentCols.length;
      for (const c of presentCols) values.push(r[c] ?? null);
      const placeholders = presentCols.map((_, j) => `$${base + j + 1}`).join(",");
      return `(${placeholders})`;
    })
    .join(",");

  const fullTableSql = `${quoteIdent(schema)}.${quoteIdent(table.name)}`;

  if (!table.pk) {
    // No PK: safest we can do is insert. This may create duplicates.
    await client.query(`insert into ${fullTableSql} (${colListSql}) values ${rowsSql}`, values);
    return;
  }

  const pkCols = table.pk.columns;
  const nonPkCols = presentCols.filter((c) => !pkCols.includes(c));

  const conflictSql = pkCols.map(quoteIdent).join(",");
  const updateSql =
    nonPkCols.length === 0
      ? "do nothing"
      : `do update set ${nonPkCols
          .map((c) => `${quoteIdent(c)} = excluded.${quoteIdent(c)}`)
          .join(",")}`;

  const sql = `insert into ${fullTableSql} (${colListSql}) values ${rowsSql} on conflict (${conflictSql}) ${updateSql}`;
  await client.query(sql, values);
}

async function main() {
  const remoteUrl = reqEnv("REMOTE_SUPABASE_URL");
  const remoteKey = cleanKey(reqEnv("REMOTE_SERVICE_ROLE_KEY"));
  const localDbUrl = reqEnv("LOCAL_DB_URL");
  const schema = process.env.SCHEMA?.trim() || "nexius_os";

  const remote = createClient(remoteUrl, remoteKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: {
        apikey: remoteKey,
        Authorization: `Bearer ${remoteKey}`,
      },
    },
  }).schema(schema);

  const local = new Client({ connectionString: localDbUrl });
  await local.connect();

  console.log(`[import] remote=${remoteUrl} schema=${schema}`);

  const tables = topoSortTables(await getTables(local, schema));
  console.log(`[import] tables=${tables.length}`);

  // Do not delete anything. Import in batches.
  const pageSize = Number(process.env.PAGE_SIZE || 1000);

  for (const table of tables) {
    console.log(`\n[table] ${schema}.${table.name} pk=${table.pk?.columns.join(",") || "(none)"} deps=${table.deps.join(",") || "-"}`);

    // Count remote rows (uses head+count exact)
    const { count, error: countErr } = await remote.from(table.name).select("*", { count: "exact", head: true });
    if (countErr) {
      console.log(`[skip] cannot count remote rows: ${countErr.message}`);
      continue;
    }

    const total = count ?? 0;
    console.log(`[remote] rows=${total}`);

    let imported = 0;
    for (let offset = 0; offset < total; offset += pageSize) {
      const { data, error } = await remote
        .from(table.name)
        .select("*")
        .range(offset, Math.min(offset + pageSize - 1, total - 1));

      if (error) {
        console.log(`[error] fetch range ${offset}..: ${error.message}`);
        break;
      }

      const rows = (data ?? []) as Record<string, any>[];
      if (rows.length === 0) break;

      await upsertBatch({ client: local, schema, table, rows });
      imported += rows.length;
      if (offset === 0 || imported % (pageSize * 5) === 0) {
        console.log(`[progress] imported=${imported}/${total}`);
      }
    }

    console.log(`[done] imported=${imported}/${total}`);
  }

  await local.end();
  console.log("\n[import] complete");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
