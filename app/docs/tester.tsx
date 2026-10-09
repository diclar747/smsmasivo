"use client";
import { useMemo, useState } from "react";
import { prepareSms, SMS_MAX, smsProblem } from "@/lib/sms-text";

type Field = { name: string; label: string; where: "path" | "query" | "body"; placeholder?: string; def?: string; area?: boolean; sms?: boolean; check?: boolean; json?: boolean };
type Action = { id: string; group: string; label: string; method: "GET" | "POST" | "PUT" | "DELETE"; path: string; fields: Field[]; danger?: string; note?: string };

const ACTIONS: Action[] = [
  { id: "balance", group: "Cuenta", label: "Consultar saldo", method: "GET", path: "/api/wallet", fields: [], note: "Devuelve balance (créditos), precio por SMS y paquetes." },
  { id: "me", group: "Cuenta", label: "Mi cuenta", method: "GET", path: "/api/me", fields: [] },
  { id: "send", group: "SMS", label: "Enviar un SMS", method: "POST", path: "/api/messages", danger: "Esto envía un SMS REAL y descuenta 1 crédito (si el envío real está activo).",
    fields: [{ name: "phone", label: "Número", where: "body", placeholder: "0981234567" }, { name: "message", label: "Mensaje", where: "body", area: true, sms: true, placeholder: "Hola, tu pedido está listo." }],
    note: "Máximo 160 caracteres GSM-7 = 1 crédito. Los acentos se envían sin tilde; la ñ se mantiene." },
  { id: "history", group: "Historial", label: "Consultar historial de envíos", method: "GET", path: "/api/reports",
    fields: [{ name: "from", label: "Desde (AAAA-MM-DD)", where: "query" }, { name: "to", label: "Hasta (AAAA-MM-DD)", where: "query" }, { name: "status", label: "Estado (simulado, aceptado, fallido)", where: "query" }, { name: "q", label: "Buscar texto o número", where: "query" }, { name: "campaign", label: "ID de campaña (o none)", where: "query" }, { name: "page", label: "Página", where: "query", def: "1" }, { name: "pageSize", label: "Por página", where: "query", def: "15" }] },
  { id: "campaigns", group: "Campañas", label: "Listar campañas", method: "GET", path: "/api/campaigns", fields: [] },
  { id: "campaign", group: "Campañas", label: "Consultar una campaña (estado en línea)", method: "GET", path: "/api/campaigns/:id",
    fields: [{ name: "id", label: "ID de campaña", where: "path" }], note: "Muestra estado, enviados, fallidos y cada destinatario." },
  { id: "campaign-create", group: "Campañas", label: "Crear campaña", method: "POST", path: "/api/campaigns",
    fields: [{ name: "name", label: "Nombre", where: "body", def: "Prueba API" }, { name: "body", label: "Mensaje (admite {nombre})", where: "body", area: true, sms: true, check: true, def: "Hola {nombre}, tenemos una novedad para vos." }, { name: "recipients", label: "Destinatarios (JSON)", where: "body", area: true, json: true, def: '[{"phone":"0981234567","name":"Ana"}]' }, { name: "scheduledAt", label: "Programar (fecha ISO, opcional)", where: "body", placeholder: "2026-10-20T09:00:00-03:00" }],
    note: "Se crea en borrador (o programada). No envía hasta ejecutarla." },
  { id: "campaign-run", group: "Campañas", label: "Enviar / procesar campaña", method: "POST", path: "/api/campaigns/:id/run",
    fields: [{ name: "id", label: "ID de campaña", where: "path" }, { name: "now", label: "Enviar ya (true/false)", where: "body", def: "true" }],
    danger: "Esto envía SMS REALES a los destinatarios de la campaña y descuenta créditos. Procesa hasta 20 por llamada: repetí hasta remaining=0." },
  { id: "campaign-pause", group: "Campañas", label: "Pausar campaña", method: "POST", path: "/api/campaigns/:id/pause", fields: [{ name: "id", label: "ID de campaña", where: "path" }] },
  { id: "campaign-cancel", group: "Campañas", label: "Cancelar campaña", method: "POST", path: "/api/campaigns/:id/cancel", fields: [{ name: "id", label: "ID de campaña", where: "path" }], danger: "Cancelar es definitivo." },
  { id: "contacts", group: "Listas", label: "Listar contactos", method: "GET", path: "/api/contacts", fields: [] },
  { id: "optouts", group: "Listas", label: "Listar números excluidos", method: "GET", path: "/api/optouts", fields: [] },
  { id: "optout-add", group: "Listas", label: "Excluir un número", method: "POST", path: "/api/optouts", fields: [{ name: "phone", label: "Número", where: "body", placeholder: "0981234567" }] },
];

const groups = [...new Set(ACTIONS.map(a => a.group))];

export default function ApiTester() {
  const [key, setKey] = useState("");
  const [show, setShow] = useState(false);
  const [id, setId] = useState("balance");
  const action = ACTIONS.find(a => a.id === id)!;
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<{ status: number; ms: number; text: string } | null>(null);

  const val = (f: Field) => values[`${id}.${f.name}`] ?? f.def ?? "";
  const set = (f: Field, v: string) => setValues(s => ({ ...s, [`${id}.${f.name}`]: v }));

  const built = useMemo(() => {
    let path = action.path; const query = new URLSearchParams(); const body: Record<string, unknown> = {}; let error = "";
    for (const f of action.fields) {
      const v = val(f).trim();
      if (f.where === "path") { if (!v) error = `Falta ${f.label}`; path = path.replace(`:${f.name}`, encodeURIComponent(v)); }
      else if (f.where === "query") { if (v) query.set(f.name, v); }
      else if (v) {
        if (f.json) { try { body[f.name] = JSON.parse(v); } catch { error = `${f.label}: JSON inválido`; } }
        else if (v === "true" || v === "false") body[f.name] = v === "true";
        else body[f.name] = v;
      }
    }
    const url = path + (query.size ? `?${query}` : "");
    const hasBody = action.method !== "GET" && action.method !== "DELETE";
    return { url, body: hasBody ? body : undefined, error };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, values, id]);

  const smsField = action.fields.find(f => f.sms);
  const smsInfo = smsField ? prepareSms(val(smsField)) : null;
  const smsIssue = smsInfo ? smsProblem(smsInfo) : null;
  const blocked = !key.trim() || !!built.error || (action.id === "send" && !!smsIssue);

  const curl = `curl ${action.method === "GET" ? "" : `-X ${action.method} `}"${typeof location === "undefined" ? "https://TU-DOMINIO" : location.origin}${built.url}" \\\n  -H "X-API-Key: ${key.trim() ? key.trim().slice(0, 8) + "…" : "sms_TU_CLAVE"}"${built.body ? ` \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(built.body)}'` : ""}`;

  async function run() {
    if (action.danger && !window.confirm(`${action.danger}\n\n¿Continuar?`)) return;
    setBusy(true); setOut(null);
    const t0 = performance.now();
    try {
      const res = await fetch(built.url, {
        method: action.method, credentials: "omit",
        headers: { "X-API-Key": key.trim(), ...(built.body ? { "Content-Type": "application/json" } : {}) },
        body: built.body ? JSON.stringify(built.body) : undefined,
      });
      const raw = await res.text();
      let text = raw; try { text = JSON.stringify(JSON.parse(raw), null, 2); } catch { /* no es JSON */ }
      setOut({ status: res.status, ms: Math.round(performance.now() - t0), text });
    } catch (e) { setOut({ status: 0, ms: Math.round(performance.now() - t0), text: e instanceof Error ? e.message : "Error de red" }); }
    finally { setBusy(false); }
  }

  return <div className="tester">
    <div className="tester-row">
      <label className="tester-field grow"><span>Tu API Key</span>
        <div className="tester-key"><input type={show ? "text" : "password"} value={key} onChange={e => setKey(e.target.value)} placeholder="sms_…" autoComplete="off" spellCheck={false} />
          <button type="button" onClick={() => setShow(s => !s)}>{show ? "Ocultar" : "Ver"}</button></div>
        <small>La clave solo se usa desde tu navegador para esta prueba y no se guarda. Generala en Panel → API.</small></label>
    </div>
    <div className="tester-row">
      <label className="tester-field grow"><span>¿Qué querés probar?</span>
        <select value={id} onChange={e => { setId(e.target.value); setOut(null); }}>
          {groups.map(g => <optgroup key={g} label={g}>{ACTIONS.filter(a => a.group === g).map(a => <option key={a.id} value={a.id}>{a.label}</option>)}</optgroup>)}
        </select></label>
      <div className="tester-endpoint"><b className={`m m-${action.method}`}>{action.method}</b><code>{built.url}</code></div>
    </div>
    {action.note && <p className="tester-note">{action.note}</p>}
    {action.fields.map(f => <label className="tester-field" key={f.name}><span>{f.label}</span>
      {f.area ? <textarea rows={f.json ? 4 : 3} value={val(f)} onChange={e => set(f, e.target.value)} placeholder={f.placeholder} spellCheck={false} />
        : <input value={val(f)} onChange={e => set(f, e.target.value)} placeholder={f.placeholder} />}
      {f.sms && smsInfo && <small className={smsIssue && !f.check ? "bad" : smsInfo.length > SMS_MAX ? "bad" : ""}>
        {smsInfo.length}/{SMS_MAX} caracteres · 1 crédito{smsInfo.changed && !smsIssue ? " · se enviará sin tildes (á→a); la ñ se mantiene" : ""}{smsIssue && !f.check ? ` · ${smsIssue}` : ""}</small>}
    </label>)}
    {built.error && <p className="tester-err">{built.error}</p>}
    <div className="tester-actions">
      <button className="tester-run" disabled={blocked || busy} onClick={run}>{busy ? "Probando…" : "Probar ahora"}</button>
      {!key.trim() && <small>Pegá tu API Key para habilitar la prueba.</small>}
    </div>
    <details className="tester-curl"><summary>Ver como cURL</summary><pre>{curl}</pre></details>
    {out && <div className="tester-out"><div className={`tester-status ${out.status >= 200 && out.status < 300 ? "ok" : "ko"}`}>{out.status || "ERROR"} · {out.ms} ms</div><pre>{out.text}</pre></div>}
  </div>;
}
