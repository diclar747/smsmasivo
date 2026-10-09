import { auth, config, db, err, id, json, normalizePhone, now, passwordHash, publicUser, random, renderMessage, seedDemo, segments, session, sha, type User, winsap } from "@/lib/server";

type Ctx = { params: Promise<{ path: string[] }> };
type Dict = Record<string, unknown>;
const body = async (r: Request): Promise<Dict> => {
  if (Number(r.headers.get("content-length") || 0) > 1_000_000) throw new Error("Solicitud demasiado grande");
  const data = await r.json();
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("JSON inválido");
  return data as Dict;
};
const requireUser = async (r: Request) => { const user = await auth(r); if (!user) throw new HttpError("Iniciá sesión para continuar", 401); return user; };
const requireAdmin = (u: User) => { if (u.role !== "admin") throw new HttpError("Acceso de administrador requerido", 403); };
class HttpError extends Error { constructor(message: string, public status = 400) { super(message); } }
const rows = async <T>(sql: string, ...args: unknown[]) => (await db().prepare(sql).bind(...args).all<T>()).results;
const first = async <T>(sql: string, ...args: unknown[]) => db().prepare(sql).bind(...args).first<T>();

async function sendOne(user: User, rawPhone: unknown, rawMessage: unknown, campaignId: string | null = null) {
  const phone = normalizePhone(rawPhone);
  const message = String(rawMessage || "").trim();
  if (!phone) throw new HttpError("Número paraguayo inválido");
  if (!message || message.length > 1000) throw new HttpError("El mensaje debe tener entre 1 y 1000 caracteres");
  const cost = segments(message);
  const reserve = await db().prepare("UPDATE users SET balance=balance-? WHERE id=? AND balance>=?").bind(cost, user.id, cost).run();
  if (!reserve.meta.changes) throw new HttpError("Saldo insuficiente", 402);
  const messageId = id();
  let providerId: string | null = null;
  let status = "simulado";
  try {
    await db().prepare("INSERT INTO messages(id,user_id,campaign_id,phone,body,status,segments,created_at) VALUES(?,?,?,?,?,'processing',?,?)")
      .bind(messageId, user.id, campaignId, phone, message, cost, now()).run();
  } catch (e) {
    await db().prepare("UPDATE users SET balance=balance+? WHERE id=?").bind(cost, user.id).run();
    throw e;
  }
  try {
    if (config.SMS_LIVE === "true") {
      const key = String(config.WINSAP_SMS_KEY || "");
      if (!key) throw new Error("Falta configurar la clave SMS");
      const sent = await winsap("/api/rest/sms/send", key, "POST", { to: phone, message });
      providerId = String(sent.message_id || "");
      status = "aceptado";
    }
  } catch (e) {
    await db().batch([
      db().prepare("UPDATE users SET balance=balance+? WHERE id=?").bind(cost, user.id),
      db().prepare("UPDATE messages SET status='fallido',error=? WHERE id=?").bind(e instanceof Error ? e.message.slice(0, 250) : "Error", messageId),
    ]);
    throw e;
  }
  await db().batch([
    db().prepare("UPDATE messages SET status=?,provider_id=? WHERE id=?").bind(status, providerId, messageId),
    db().prepare("INSERT INTO ledger(id,user_id,delta,reason,created_at) VALUES(?,?,?,?,?)")
      .bind(id(), user.id, -cost, campaignId ? `Campaña ${campaignId}` : "SMS individual", now()),
  ]);
  return { id: messageId, phone, status, segments: cost, providerId };
}

async function runCampaign(user: User, campaignId: string) {
  const campaign = await first<{ id: string; body: string; status: string; scheduled_at: string | null }>("SELECT * FROM campaigns WHERE id=? AND user_id=?", campaignId, user.id);
  if (!campaign) throw new HttpError("Campaña no encontrada", 404);
  if (campaign.status === "cancelled" || campaign.status === "completed") throw new HttpError("La campaña ya terminó");
  if (campaign.scheduled_at && campaign.scheduled_at > now()) throw new HttpError("La campaña aún no llegó a su horario");
  await db().prepare("UPDATE campaigns SET status='sending' WHERE id=?").bind(campaignId).run();
  const pending = await rows<{ id: string; phone: string; name: string; variables: string }>("SELECT * FROM recipients WHERE campaign_id=? AND status='pending' ORDER BY rowid LIMIT 20", campaignId);
  for (const rec of pending) {
    const claim = await db().prepare("UPDATE recipients SET status='processing' WHERE id=? AND status='pending'").bind(rec.id).run();
    if (!claim.meta.changes) continue;
    try {
      const vars = JSON.parse(rec.variables || "{}");
      const rendered = renderMessage(campaign.body, { ...vars, nombre: rec.name, numero: rec.phone });
      const result = await sendOne(user, rec.phone, rendered, campaignId);
      await db().batch([
        db().prepare("UPDATE recipients SET status=?, provider_id=?, sent_at=? WHERE id=?").bind(result.status, result.providerId, now(), rec.id),
        db().prepare("UPDATE campaigns SET sent=sent+1 WHERE id=?").bind(campaignId),
      ]);
    } catch (e) {
      await db().batch([
        db().prepare("UPDATE recipients SET status='failed',error=? WHERE id=?").bind(e instanceof Error ? e.message.slice(0, 250) : "Error", rec.id),
        db().prepare("UPDATE campaigns SET failed=failed+1 WHERE id=?").bind(campaignId),
      ]);
    }
  }
  const left = await first<{ n: number }>("SELECT COUNT(*) AS n FROM recipients WHERE campaign_id=? AND status='pending'", campaignId);
  if (!left?.n) await db().prepare("UPDATE campaigns SET status='completed' WHERE id=?").bind(campaignId).run();
  return { processed: pending.length, remaining: left?.n || 0 };
}

async function handler(r: Request, ctx: Ctx, method: string): Promise<Response> {
  const path = (await ctx.params).path;
  const route = path.join("/");
  const url = new URL(r.url);
  if (method !== "GET" && !r.headers.get("x-api-key")) {
    const origin = r.headers.get("origin");
    if (origin && origin !== url.origin) return err("Origen no permitido", 403);
  }
  if (route === "bootstrap" && method === "GET") {
    await seedDemo();
    const user = await auth(r);
    const packages = await rows("SELECT * FROM packages WHERE active=1 ORDER BY credits");
    return json({ user: user ? publicUser(user) : null, packages, smsLive: config.SMS_LIVE === "true", paymentsLive: config.PAYMENTS_LIVE === "true", googleAvailable: !!config.GOOGLE_CLIENT_ID && !!config.GOOGLE_CLIENT_SECRET });
  }
  if (route === "auth/register" && method === "POST") {
    const data = await body(r);
    const name = String(data.name || "").trim().slice(0, 100);
    const email = String(data.email || "").toLowerCase().trim();
    const password = String(data.password || "");
    if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || password.length < 10) return err("Nombre, correo y contraseña de al menos 10 caracteres requeridos");
    if (await first("SELECT id FROM users WHERE email=?", email)) return err("Ese correo ya existe", 409);
    const salt = random(16), userId = id();
    await db().prepare("INSERT INTO users(id,name,email,password_hash,password_salt,role,status,balance,created_at) VALUES(?,?,?,?,?,'user','active',0,?)")
      .bind(userId, name, email, await passwordHash(password, salt), salt, now()).run();
    return json({ ok: true }, 201, { "Set-Cookie": await session(userId, r.url) });
  }
  if (route === "auth/login" && method === "POST") {
    const data = await body(r);
    const email = String(data.email || "").toLowerCase().trim();
    const user = await first<User>("SELECT * FROM users WHERE email=? AND status='active'", email);
    if (!user?.password_hash || !user.password_salt || await passwordHash(String(data.password || ""), user.password_salt) !== user.password_hash) return err("Credenciales incorrectas", 401);
    return json({ user: publicUser(user) }, 200, { "Set-Cookie": await session(user.id, r.url) });
  }
  if (route === "auth/logout" && method === "POST") {
    const cookie = r.headers.get("cookie")?.match(/(?:^|;\s*)sms_session=([^;]+)/)?.[1];
    if (cookie) await db().prepare("DELETE FROM sessions WHERE token_hash=?").bind(await sha(cookie)).run();
    return json({ ok: true }, 200, { "Set-Cookie": "sms_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0" });
  }
  if (route === "auth/google" && method === "GET") {
    if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET) return err("Google aún no está configurado", 503);
    const state = random(24);
    const redirect = `${url.origin}/api/auth/google/callback`;
    const params = new URLSearchParams({ client_id: String(config.GOOGLE_CLIENT_ID), redirect_uri: redirect, response_type: "code", scope: "openid email profile", state });
    return new Response(null, { status: 302, headers: { Location: `https://accounts.google.com/o/oauth2/v2/auth?${params}`, "Set-Cookie": `sms_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600` } });
  }
  if (route === "auth/google/callback" && method === "GET") {
    const state = r.headers.get("cookie")?.match(/(?:^|;\s*)sms_oauth_state=([^;]+)/)?.[1];
    if (!state || state !== url.searchParams.get("state") || !url.searchParams.get("code")) return err("Inicio con Google inválido", 401);
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: String(config.GOOGLE_CLIENT_ID), client_secret: String(config.GOOGLE_CLIENT_SECRET), code: url.searchParams.get("code")!, grant_type: "authorization_code", redirect_uri: `${url.origin}/api/auth/google/callback` }) });
    if (!tokenResponse.ok) return err("Google no autorizó el acceso", 401);
    const tokenData = await tokenResponse.json() as { access_token: string };
    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
    const profile = await profileResponse.json() as { sub?: string; email?: string; email_verified?: boolean; name?: string };
    if (!profile.sub || !profile.email || !profile.email_verified) return err("Google no verificó el correo", 401);
    let user = await first<User>("SELECT * FROM users WHERE google_sub=?", profile.sub);
    if (!user) {
      const existing = await first<User>("SELECT * FROM users WHERE email=?", profile.email.toLowerCase());
      if (existing) { await db().prepare("UPDATE users SET google_sub=? WHERE id=?").bind(profile.sub, existing.id).run(); user = existing; }
      else {
        const userId = id();
        await db().prepare("INSERT INTO users(id,name,email,google_sub,role,status,balance,created_at) VALUES(?,?,?,?,'user','active',0,?)").bind(userId, profile.name || profile.email, profile.email.toLowerCase(), profile.sub, now()).run();
        user = await first<User>("SELECT * FROM users WHERE id=?", userId);
      }
    }
    if (!user || user.status !== "active") return err("Cuenta inactiva", 403);
    return new Response(null, { status: 302, headers: { Location: `${url.origin}/app`, "Set-Cookie": await session(user.id, r.url) } });
  }

  if (route === "internal/dispatch" && method === "POST") {
    const secret = String(config.CRON_SECRET || "");
    if (!secret || await sha(r.headers.get("x-cron-secret") || "") !== await sha(secret)) return err("No autorizado", 401);
    const due = await rows<{ id: string; user_id: string }>("SELECT c.id,c.user_id FROM campaigns c JOIN users u ON u.id=c.user_id WHERE u.status='active' AND c.status IN ('scheduled','sending') AND (c.scheduled_at IS NULL OR c.scheduled_at<=?) ORDER BY c.created_at LIMIT 4", now());
    const results = [];
    for (const campaign of due) {
      const owner = await first<User>("SELECT * FROM users WHERE id=?", campaign.user_id);
      if (owner) results.push({ id: campaign.id, ...(await runCampaign(owner, campaign.id)) });
    }
    return json({ results });
  }

  const user = await requireUser(r);
  if (route === "me" && method === "GET") return json({ user: publicUser(user) });
  if (route === "dashboard" && method === "GET") {
    const campaigns = await rows("SELECT * FROM campaigns WHERE user_id=? ORDER BY created_at DESC LIMIT 6", user.id);
    const messages = await rows("SELECT * FROM messages WHERE user_id=? ORDER BY created_at DESC LIMIT 8", user.id);
    const stats = await first("SELECT COUNT(*) AS total, SUM(CASE WHEN status='aceptado' OR status='simulado' THEN 1 ELSE 0 END) AS sent, SUM(CASE WHEN status='fallido' THEN 1 ELSE 0 END) AS failed FROM messages WHERE user_id=?", user.id);
    const contacts = await first("SELECT COUNT(*) AS total FROM contacts WHERE user_id=?", user.id);
    return json({ campaigns, messages, stats, contacts: (contacts as { total: number })?.total || 0, balance: (await first<User>("SELECT balance FROM users WHERE id=?", user.id))?.balance || 0 });
  }
  if (route === "contacts" && method === "GET") return json({ contacts: await rows("SELECT * FROM contacts WHERE user_id=? ORDER BY created_at DESC LIMIT 2000", user.id) });
  if (route === "contacts" && method === "POST") {
    const data = await body(r);
    const items = Array.isArray(data.contacts) ? data.contacts.slice(0, 2000) as Dict[] : [];
    if (!items.length) return err("No hay contactos válidos");
    let added = 0;
    const existing = new Set((await rows<{ phone: string }>("SELECT phone FROM contacts WHERE user_id=?", user.id)).map(x => x.phone));
    for (const item of items) {
      const phone = normalizePhone(item.phone);
      if (!phone || existing.has(phone)) continue;
      const vars = item.variables && typeof item.variables === "object" && !Array.isArray(item.variables) ? item.variables : {};
      await db().prepare("INSERT INTO contacts(id,user_id,phone,name,variables,created_at) VALUES(?,?,?,?,?,?)").bind(id(), user.id, phone, String(item.name || "").slice(0, 100), JSON.stringify(vars), now()).run();
      existing.add(phone); added++;
    }
    return json({ added });
  }
  if (path[0] === "contacts" && path[1] && method === "DELETE") {
    await db().prepare("DELETE FROM contacts WHERE id=? AND user_id=?").bind(path[1], user.id).run(); return json({ ok: true });
  }
  if (route === "messages" && method === "POST") {
    const data = await body(r); return json({ message: await sendOne(user, data.phone, data.message) }, 201);
  }
  if (route === "campaigns" && method === "GET") return json({ campaigns: await rows("SELECT * FROM campaigns WHERE user_id=? ORDER BY created_at DESC LIMIT 500", user.id) });
  if (route === "campaigns" && method === "POST") {
    const data = await body(r);
    const name = String(data.name || "").trim().slice(0, 120), text = String(data.body || "").trim();
    const items = Array.isArray(data.recipients) ? data.recipients.slice(0, 2000) as Dict[] : [];
    if (!name || !text || text.length > 1000 || !items.length) return err("Nombre, mensaje y destinatarios requeridos");
    const unique = new Map<string, Dict>();
    for (const item of items) { const phone = normalizePhone(item.phone); if (phone && !unique.has(phone)) unique.set(phone, item); }
    if (!unique.size) return err("No hay números válidos");
    const scheduled = data.scheduledAt ? new Date(String(data.scheduledAt)).toISOString() : null;
    const campaignId = id();
    await db().prepare("INSERT INTO campaigns(id,user_id,name,body,scheduled_at,status,total,created_at) VALUES(?,?,?,?,?,?,?,?)")
      .bind(campaignId, user.id, name, text, scheduled, scheduled ? "scheduled" : "draft", unique.size, now()).run();
    for (const [phone, item] of unique) {
      const vars = item.variables && typeof item.variables === "object" ? item.variables : {};
      await db().prepare("INSERT INTO recipients(id,campaign_id,phone,name,variables,status) VALUES(?,?,?,?,?,'pending')")
        .bind(id(), campaignId, phone, String(item.name || "").slice(0, 100), JSON.stringify(vars)).run();
    }
    return json({ id: campaignId, total: unique.size }, 201);
  }
  if (path[0] === "campaigns" && path[1] && path.length === 2 && method === "GET") {
    const campaign = await first("SELECT * FROM campaigns WHERE id=? AND user_id=?", path[1], user.id);
    if (!campaign) return err("Campaña no encontrada", 404);
    return json({ campaign, recipients: await rows("SELECT * FROM recipients WHERE campaign_id=? ORDER BY rowid LIMIT 2000", path[1]) });
  }
  if (path[0] === "campaigns" && path[1] && path.length === 2 && method === "PUT") {
    const data = await body(r);
    const camp = await first<{ status: string }>("SELECT status FROM campaigns WHERE id=? AND user_id=?", path[1], user.id);
    if (!camp) return err("Campaña no encontrada", 404);
    if (camp.status !== "draft" && camp.status !== "scheduled") return err("Sólo se pueden editar campañas pendientes");
    const scheduled = data.scheduledAt ? new Date(String(data.scheduledAt)).toISOString() : null;
    await db().prepare("UPDATE campaigns SET name=?,body=?,scheduled_at=?,status=? WHERE id=?").bind(String(data.name || "").trim().slice(0, 120), String(data.body || "").trim().slice(0, 1000), scheduled, scheduled ? "scheduled" : "draft", path[1]).run();
    return json({ ok: true });
  }
  if (path[0] === "campaigns" && path[1] && path.length === 2 && method === "DELETE") {
    await db().prepare("UPDATE campaigns SET status='cancelled' WHERE id=? AND user_id=? AND status IN ('draft','scheduled')").bind(path[1], user.id).run();
    return json({ ok: true });
  }
  if (path[0] === "campaigns" && path[1] && path[2] === "run" && method === "POST") return json(await runCampaign(user, path[1]));
  if (route === "campaigns/process" && method === "POST") {
    const due = await rows<{ id: string }>("SELECT id FROM campaigns WHERE user_id=? AND status IN ('scheduled','sending') AND (scheduled_at IS NULL OR scheduled_at<=?) ORDER BY created_at LIMIT 4", user.id, now());
    const results = [];
    for (const c of due) results.push({ id: c.id, ...(await runCampaign(user, c.id)) });
    return json({ results });
  }
  if (route === "reports" && method === "GET") {
    const from = url.searchParams.get("from") || "0000-01-01";
    const to = url.searchParams.get("to") ? `${url.searchParams.get("to")}T23:59:59.999Z` : "9999-12-31";
    const campaign = url.searchParams.get("campaign") || "";
    const status = url.searchParams.get("status") || "";
    const messages = await rows("SELECT * FROM messages WHERE user_id=? AND created_at>=? AND created_at<=? AND (?='' OR campaign_id=?) AND (?='' OR status=?) ORDER BY created_at DESC LIMIT 1000", user.id, from, to, campaign, campaign, status, status);
    return json({ messages });
  }
  if (route === "wallet" && method === "GET") return json({ balance: (await first<User>("SELECT balance FROM users WHERE id=?", user.id))?.balance || 0, ledger: await rows("SELECT * FROM ledger WHERE user_id=? ORDER BY created_at DESC LIMIT 100", user.id), orders: await rows("SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC LIMIT 100", user.id), packages: await rows("SELECT * FROM packages WHERE active=1 ORDER BY credits") });
  if (route === "wallet/provider-balance" && method === "GET") {
    requireAdmin(user);
    if (!config.WINSAP_SMS_KEY) return err("Proveedor SMS no configurado", 503);
    return json(await winsap("/api/rest/sms/balance", String(config.WINSAP_SMS_KEY)));
  }
  if (route === "orders" && method === "POST") {
    if (config.PAYMENTS_LIVE !== "true" || !config.WINSAP_PAYMENTS_KEY) return err("Los pagos están desactivados hasta confirmar los precios", 503);
    const data = await body(r);
    const pkg = await first<{ id: string; credits: number; price: number }>("SELECT * FROM packages WHERE id=? AND active=1", String(data.packageId || ""));
    if (!pkg) return err("Paquete no disponible", 404);
    const orderId = id();
    const payment = await winsap("/api/v1/payment-links", String(config.WINSAP_PAYMENTS_KEY), "POST", { name: `${pkg.credits} créditos SMS`, description: `Recarga SMS #${orderId}`, price: pkg.price, currency: "PYG", product_type: "digital", reference: orderId, success_url: `${url.origin}/app?payment=success`, cancel_url: `${url.origin}/app?payment=cancelled` });
    const link = payment.data as { id: number; payment_url: string };
    await db().prepare("INSERT INTO orders(id,user_id,credits,price,payment_link_id,payment_url,status,created_at) VALUES(?,?,?,?,?,?,'pending',?)")
      .bind(orderId, user.id, pkg.credits, pkg.price, String(link.id), link.payment_url, now()).run();
    return json({ id: orderId, paymentUrl: link.payment_url }, 201);
  }
  if (path[0] === "orders" && path[1] && path[2] === "verify" && method === "POST") {
    const order = await first<{ id: string; user_id: string; credits: number; price: number; payment_link_id: string; status: string }>("SELECT * FROM orders WHERE id=? AND user_id=?", path[1], user.id);
    if (!order) return err("Orden no encontrada", 404);
    if (order.status === "paid") return json({ status: "paid" });
    if (!config.WINSAP_PAYMENTS_KEY) return err("Proveedor de pagos no configurado", 503);
    let matched = false;
    for (let page = 1; page <= 5 && !matched; page++) {
      const result = await winsap(`/api/v1/payments?status=paid&limit=100&page=${page}`, String(config.WINSAP_PAYMENTS_KEY));
      const payments = Array.isArray(result.data) ? result.data as { link_id: number; amount: number; status: string }[] : [];
      matched = payments.some(p => String(p.link_id) === order.payment_link_id && Number(p.amount) === order.price && p.status === "paid");
      if (payments.length < 100) break;
    }
    if (!matched) return json({ status: "pending" });
    await db().batch([
      db().prepare("UPDATE users SET balance=balance+? WHERE id=? AND EXISTS(SELECT 1 FROM orders WHERE id=? AND status='pending')").bind(order.credits, user.id, order.id),
      db().prepare("UPDATE orders SET status='paid' WHERE id=? AND status='pending'").bind(order.id),
      db().prepare("INSERT OR IGNORE INTO ledger(id,user_id,delta,reason,created_at) VALUES(?,?,?,?,?)").bind(order.id, user.id, order.credits, `Compra ${order.id}`, now()),
    ]);
    return json({ status: "paid" });
  }
  if (route === "keys" && method === "GET") return json({ keys: await rows("SELECT id,name,prefix,created_at,revoked_at FROM api_keys WHERE user_id=? ORDER BY created_at DESC", user.id) });
  if (route === "keys" && method === "POST") {
    const data = await body(r); const key = `sms_${random(24)}`;
    await db().prepare("INSERT INTO api_keys(id,user_id,name,key_hash,prefix,created_at) VALUES(?,?,?,?,?,?)")
      .bind(id(), user.id, String(data.name || "API SMS").slice(0, 80), await sha(key), key.slice(0, 12), now()).run();
    return json({ key }, 201);
  }
  if (path[0] === "keys" && path[1] && method === "DELETE") {
    await db().prepare("UPDATE api_keys SET revoked_at=? WHERE id=? AND user_id=?").bind(now(), path[1], user.id).run(); return json({ ok: true });
  }
  if (route === "admin/users" && method === "GET") {
    requireAdmin(user);
    const query = `%${String(url.searchParams.get("q") || "").slice(0, 100)}%`;
    return json({ users: await rows("SELECT id,name,email,role,status,balance,created_at FROM users WHERE name LIKE ? OR email LIKE ? ORDER BY created_at DESC LIMIT 500", query, query) });
  }
  if (route === "admin/users" && method === "POST") {
    requireAdmin(user); const data = await body(r);
    const email = String(data.email || "").toLowerCase().trim(); const password = String(data.password || "");
    if (!email || password.length < 10) return err("Correo y contraseña de al menos 10 caracteres requeridos");
    const salt = random(16), userId = id();
    await db().prepare("INSERT INTO users(id,name,email,password_hash,password_salt,role,status,balance,created_at) VALUES(?,?,?,?,?,?,?,?,?)")
      .bind(userId, String(data.name || "").trim(), email, await passwordHash(password, salt), salt, data.role === "admin" ? "admin" : "user", "active", 0, now()).run();
    return json({ id: userId }, 201);
  }
  if (path[0] === "admin" && path[1] === "users" && path[2] && method === "PUT") {
    requireAdmin(user); const data = await body(r); const target = path[2];
    if (target === user.id && (data.status === "disabled" || data.role === "user")) return err("No podés desactivar tu propia cuenta");
    const current = await first("SELECT id FROM users WHERE id=?", target); if (!current) return err("Usuario no encontrado", 404);
    await db().prepare("UPDATE users SET name=?,email=?,role=?,status=? WHERE id=?")
      .bind(String(data.name || "").trim().slice(0, 100), String(data.email || "").toLowerCase().trim(), data.role === "admin" ? "admin" : "user", data.status === "disabled" ? "disabled" : "active", target).run();
    return json({ ok: true });
  }
  if (path[0] === "admin" && path[1] === "users" && path[2] && method === "DELETE") {
    requireAdmin(user); if (path[2] === user.id) return err("No podés eliminar tu propia cuenta");
    await db().prepare("UPDATE users SET status='disabled' WHERE id=?").bind(path[2]).run(); return json({ ok: true });
  }
  if (path[0] === "admin" && path[1] === "users" && path[2] && path[3] === "balance" && method === "POST") {
    requireAdmin(user); const data = await body(r); const delta = Number(data.delta);
    if (!Number.isInteger(delta) || Math.abs(delta) > 1000000 || delta === 0) return err("Ajuste de saldo inválido");
    const update = await db().prepare("UPDATE users SET balance=balance+? WHERE id=? AND balance+?>=0").bind(delta, path[2], delta).run();
    if (!update.meta.changes) return err("Saldo insuficiente o usuario no encontrado");
    await db().prepare("INSERT INTO ledger(id,user_id,delta,reason,created_at) VALUES(?,?,?,?,?)").bind(id(), path[2], delta, `Ajuste admin: ${String(data.reason || "manual").slice(0, 120)}`, now()).run();
    return json({ ok: true });
  }
  if (route === "admin/packages" && method === "GET") { requireAdmin(user); return json({ packages: await rows("SELECT * FROM packages ORDER BY credits") }); }
  if (route === "admin/packages" && method === "POST") {
    requireAdmin(user); const data = await body(r); const credits = Number(data.credits), price = Number(data.price);
    if (!Number.isInteger(credits) || credits < 1 || !Number.isInteger(price) || price < 1) return err("Créditos y precio inválidos");
    await db().prepare("INSERT INTO packages(id,credits,price,active) VALUES(?,?,?,?)").bind(id(), credits, price, data.active ? 1 : 0).run(); return json({ ok: true });
  }
  if (path[0] === "admin" && path[1] === "packages" && path[2] && method === "PUT") {
    requireAdmin(user); const data = await body(r);
    await db().prepare("UPDATE packages SET credits=?,price=?,active=? WHERE id=?").bind(Number(data.credits), Number(data.price), data.active ? 1 : 0, path[2]).run(); return json({ ok: true });
  }
  return err("Ruta no encontrada", 404);
}

async function safe(r: Request, ctx: Ctx, method: string) {
  try { return await handler(r, ctx, method); }
  catch (e) { if (e instanceof HttpError) return err(e.message, e.status); console.error("API error", e); return err(e instanceof Error && /invalid|grande|JSON/.test(e.message) ? e.message : "No se pudo completar la operación", 500); }
}
export const GET = (r: Request, c: Ctx) => safe(r, c, "GET");
export const POST = (r: Request, c: Ctx) => safe(r, c, "POST");
export const PUT = (r: Request, c: Ctx) => safe(r, c, "PUT");
export const DELETE = (r: Request, c: Ctx) => safe(r, c, "DELETE");
