import { env } from "cloudflare:workers";
import { Client, types } from "pg";

export const config = env as unknown as Record<string, string | undefined>;

// bigint (COUNT/SUM) y numeric llegan como string; la app los usa como número.
types.setTypeParser(20, v => Number(v));
types.setTypeParser(1700, v => Number(v));

/** Capa mínima compatible con la API de D1 (prepare/bind/first/all/run/batch) sobre PostgreSQL. */
const toPg = (sql: string) => { let n = 0; return sql.replace(/\?/g, () => `$${++n}`); };
async function withClient<T>(fn: (c: Client) => Promise<T>): Promise<T> {
  if (!config.DATABASE_URL) throw new Error("Base de datos no disponible");
  const client = new Client({ connectionString: config.DATABASE_URL, connectionTimeoutMillis: 10000 });
  await client.connect();
  try { return await fn(client); } finally { await client.end().catch(() => {}); }
}
class Statement {
  args: unknown[] = [];
  constructor(readonly sql: string) {}
  bind(...args: unknown[]) { this.args = args; return this; }
  exec(c: Client) { return c.query(toPg(this.sql), this.args as unknown[]); }
  async all<T = Record<string, unknown>>() { const r = await withClient(c => this.exec(c)); return { results: r.rows as T[], meta: { changes: r.rowCount ?? 0 } }; }
  async first<T = Record<string, unknown>>() { const r = await withClient(c => this.exec(c)); return (r.rows[0] ?? null) as T | null; }
  async run() { const r = await withClient(c => this.exec(c)); return { meta: { changes: r.rowCount ?? 0 } }; }
}
export const db = () => ({
  prepare: (sql: string) => new Statement(sql),
  /** Ejecuta las sentencias en una sola transacción. */
  batch: (statements: Statement[]) => withClient(async c => {
    await c.query("BEGIN");
    try {
      const out = [];
      for (const st of statements) { const r = await st.exec(c); out.push({ results: r.rows, meta: { changes: r.rowCount ?? 0 } }); }
      await c.query("COMMIT");
      return out;
    } catch (e) { await c.query("ROLLBACK").catch(() => {}); throw e; }
  }),
});
export const now = () => new Date().toISOString();
export const id = () => crypto.randomUUID();
export const json = (value: unknown, status = 200, headers?: HeadersInit) => Response.json(value, { status, headers });
export const err = (message: string, status = 400) => json({ error: message }, status);
export const random = (n = 32) => Array.from(crypto.getRandomValues(new Uint8Array(n)), x => x.toString(16).padStart(2, "0")).join("");
export async function sha(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), x => x.toString(16).padStart(2, "0")).join("");
}
export async function passwordHash(password: string, salt: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(salt), iterations: 210000 }, key, 256);
  return Array.from(new Uint8Array(bits), x => x.toString(16).padStart(2, "0")).join("");
}
export type User = { id: string; name: string; email: string; role: string; status: string; balance: number; avatar_url?: string | null; password_hash?: string; password_salt?: string };
export const publicUser = (u: User) => ({ id: u.id, name: u.name, email: u.email, role: u.role, status: u.status, balance: u.balance, avatar: u.avatar_url || null });
export async function auth(request: Request): Promise<User | null> {
  const cookie = request.headers.get("cookie")?.match(/(?:^|;\s*)sms_session=([^;]+)/)?.[1];
  const apiKey = request.headers.get("x-api-key");
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const token = cookie || bearer;
  if (token) {
    const hash = await sha(token);
    const row = await db().prepare("SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND u.status='active'").bind(hash, now()).first<User>();
    if (row) return row;
  }
  if (apiKey) {
    const hash = await sha(apiKey);
    return await db().prepare("SELECT u.* FROM api_keys k JOIN users u ON u.id=k.user_id WHERE k.key_hash=? AND k.revoked_at IS NULL AND u.status='active'").bind(hash).first<User>();
  }
  return null;
}
export async function session(userId: string, requestUrl?: string) {
  const token = random();
  await db().prepare("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)").bind(await sha(token), userId, new Date(Date.now() + 7 * 86400000).toISOString()).run();
  const secure = !requestUrl || new URL(requestUrl).protocol === "https:" ? "; Secure" : "";
  return `sms_session=${token}; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=604800`;
}
export class RateLimitError extends Error { constructor(public retryAfter: number) { super("Demasiadas solicitudes. Intentá de nuevo en unos minutos."); } }
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const nowSec = Math.floor(Date.now() / 1000);
  const start = nowSec - (nowSec % windowSeconds);
  const row = await db().prepare("INSERT INTO rate_limits(key,window_start,count) VALUES(?,?,1) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN rate_limits.window_start=excluded.window_start THEN rate_limits.count+1 ELSE 1 END, window_start=excluded.window_start RETURNING rate_limits.count")
    .bind(key, start).first<{ count: number }>();
  if ((row?.count ?? 1) > limit) throw new RateLimitError(start + windowSeconds - nowSec);
}
export const clientIp = (r: Request) => r.headers.get("cf-connecting-ip") || r.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
export function normalizePhone(input: unknown) {
  const digits = String(input ?? "").replace(/\D/g, "");
  const phone = digits.startsWith("595") ? digits : digits.startsWith("0") ? `595${digits.slice(1)}` : `595${digits}`;
  return /^5959\d{8}$/.test(phone) ? phone : null;
}
export function renderMessage(body: string, row: Record<string, unknown>) {
  return body.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) => String(row[key] ?? ""));
}
export function segments(body: string) {
  const gsm = /^[\x00-\x7F€£¥èéùìòÇØøÅåΔΦΓΛΩΠΨΣΘΞÆæÉßÑñÜüà^{}\\[~\]|]*$/.test(body);
  const length = [...body].length;
  return gsm ? (length <= 160 ? 1 : Math.ceil(length / 153)) : (length <= 70 ? 1 : Math.ceil(length / 67));
}
export async function winsap(path: string, key: string, method = "GET", body?: unknown) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`https://winsap.com.py${path}`, {
      method, headers: { "X-API-Key": key, ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined, signal: controller.signal,
    });
    const data = await response.json() as Record<string, unknown>;
    if (!response.ok || !data.success) throw new Error(String(data.error || `Winsap respondió ${response.status}`));
    return data;
  } finally { clearTimeout(timeout); }
}
export async function seedDemo() {
  const adminPassword = String(config.DEMO_ADMIN_PASSWORD || "");
  const userPassword = String(config.DEMO_USER_PASSWORD || "");
  if (!adminPassword || !userPassword) return;
  const count = await db().prepare("SELECT COUNT(*) AS count FROM users").first<{ count: number }>();
  if (count?.count) return;
  const date = now();
  for (const [name, email, password, role, balance] of [
    ["Administración Demo", "admin@demo.sms.py", adminPassword, "admin", 500],
    ["Usuario Demo", "usuario@demo.sms.py", userPassword, "user", 80],
  ] as const) {
    const salt = random(16);
    await db().prepare("INSERT INTO users(id,name,email,password_hash,password_salt,role,status,balance,created_at) VALUES(?,?,?,?,?,?,?,?,?)")
      .bind(id(), name, email, await passwordHash(password, salt), salt, role, "active", balance, date).run();
  }
  const admin = await db().prepare("SELECT id FROM users WHERE email='admin@demo.sms.py'").first<{ id: string }>();
  const sample = [["María González", "595981234567"], ["Carlos Benítez", "595982345678"], ["Ana López", "595983456789"]];
  if (admin) for (const [name, phone] of sample) await db().prepare("INSERT INTO contacts(id,user_id,phone,name,variables,created_at) VALUES(?,?,?,?,?,?)")
    .bind(id(), admin.id, phone, name, "{}", date).run();
}
