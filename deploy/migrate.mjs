// Aplica drizzle/*.sql en orden contra DATABASE_URL (registra lo aplicado en _migrations).
import { readdirSync, readFileSync } from "node:fs";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) { console.error("Falta DATABASE_URL"); process.exit(1); }
const client = new pg.Client({ connectionString: url });
for (let i = 1; ; i++) {
  try { await client.connect(); break; }
  catch (e) { if (i >= 30) throw e; console.log(`Esperando a la base de datos (${i})…`); await new Promise(r => setTimeout(r, 2000)); }
}
await client.query("CREATE TABLE IF NOT EXISTS _migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())");
const done = new Set((await client.query("SELECT name FROM _migrations")).rows.map(r => r.name));
for (const file of readdirSync(new URL("../drizzle/", import.meta.url)).filter(f => f.endsWith(".sql")).sort()) {
  if (done.has(file)) continue;
  console.log("Migración", file);
  await client.query("BEGIN");
  try {
    await client.query(readFileSync(new URL(`../drizzle/${file}`, import.meta.url), "utf8"));
    await client.query("INSERT INTO _migrations(name) VALUES($1)", [file]);
    await client.query("COMMIT");
  } catch (e) { await client.query("ROLLBACK"); throw e; }
}
await client.end();
