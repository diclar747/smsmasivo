/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Ban, CalendarClock, Check, ChevronLeft, ChevronRight, Copy, Eye, FileSpreadsheet, Pause, Pencil, Play, Plus, Search, Send, Trash2, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type Ask, type Campaign, type Contact, type Recipient, Empty, Status, date, fmt, normalizePhone, parseSpreadsheet, pct, renderMessage, request, segmentsOf } from "./shared";

const FILTERS: [string, string][] = [["all", "Todas"], ["draft", "Borradores"], ["scheduled", "Programadas"], ["sending", "Enviando"], ["paused", "Pausadas"], ["completed", "Completadas"], ["cancelled", "Canceladas"]];
const toLocalInput = (iso: string | null) => { if (!iso) return ""; const d = new Date(iso); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };
const errMsg = (e: unknown, fallback = "Ocurrió un error") => e instanceof Error ? e.message : fallback;

type Props = { ask: Ask; flash: (s: string) => void; balance: number; onChanged: () => void; composeSignal: number };

export default function CampaignsView({ ask, flash, balance, onChanged, composeSignal }: Props) {
  const [list, setList] = useState<Campaign[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState("all"), [query, setQuery] = useState(""), [sort, setSort] = useState("recent"), [from, setFrom] = useState(""), [to, setTo] = useState("");
  const [running, setRunning] = useState<Record<string, boolean>>({});
  const [wizard, setWizard] = useState<null | { name: string; body: string; rows: Recipient[] | null }>(null);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [detail, setDetail] = useState<{ campaign: Campaign; recipients: any[] } | null>(null);
  const runners = useRef<Set<string>>(new Set());
  const alive = useRef(true);

  const flashRef = useRef(flash); flashRef.current = flash;
  const load = useCallback(async () => { try { setList((await request("campaigns")).campaigns); } catch (e) { flashRef.current(errMsg(e, "No se pudieron cargar las campañas")); } finally { setLoaded(true); } }, []);
  useEffect(() => { alive.current = true; load(); const r = runners.current; return () => { alive.current = false; r.clear(); }; }, [load]);
  useEffect(() => { if (composeSignal) setWizard({ name: "", body: "", rows: null }); }, [composeSignal]);
  // Mientras haya campañas enviándose (aunque las procese el temporizador del panel) se refresca el avance.
  useEffect(() => {
    if (!list.some(c => c.status === "sending")) return;
    const t = setInterval(() => { if (!runners.current.size) load(); }, 4000);
    return () => clearInterval(t);
  }, [list, load]);

  const patch = (id: string, p: Partial<Campaign>) => setList(prev => prev.map(c => c.id === id ? { ...c, ...p } : c));

  async function drive(c: Campaign) {
    if (runners.current.has(c.id)) return;
    runners.current.add(c.id); setRunning(r => ({ ...r, [c.id]: true }));
    try {
      while (runners.current.has(c.id) && alive.current) {
        const d = await request(`campaigns/${c.id}/run`, "POST", { now: true });
        patch(c.id, { status: d.status, sent: d.sent, failed: d.failed, total: d.total });
        if (!d.remaining || d.status !== "sending") { if (d.status === "completed") flash(`Campaña “${c.name}” completada: ${fmt(d.sent)} enviados, ${fmt(d.failed)} fallidos.`); break; }
      }
    } catch (e) {
      flash(/saldo/i.test(errMsg(e)) ? `Sin saldo: “${c.name}” quedó pausada. Recargá y reanudala.` : errMsg(e));
      await load();
    } finally { runners.current.delete(c.id); setRunning(r => { const n = { ...r }; delete n[c.id]; return n; }); onChanged(); }
  }
  async function start(c: Campaign) {
    const pending = Math.max(0, c.total - c.sent - c.failed);
    const resuming = c.status === "paused" || c.sent + c.failed > 0;
    const ok = await ask({ title: resuming ? "Reanudar campaña" : "Enviar campaña", message: `Se enviarán ${fmt(pending)} mensajes ahora. Tenés ${fmt(balance)} créditos (cada mensaje usa al menos 1).`, confirmLabel: resuming ? "Reanudar" : "Enviar ahora" });
    if (ok) drive(c);
  }
  async function stop(c: Campaign) {
    runners.current.delete(c.id);
    try { await request(`campaigns/${c.id}/pause`, "POST"); patch(c.id, { status: "paused" }); flash(`“${c.name}” detenida. Podés reanudarla cuando quieras.`); } catch (e) { flash(errMsg(e)); }
    load();
  }
  async function cancel(c: Campaign) {
    if (!await ask({ title: "Cancelar campaña", message: `“${c.name}” no se va a enviar más. Los mensajes ya enviados se mantienen.`, confirmLabel: "Cancelar campaña", danger: true })) return;
    runners.current.delete(c.id);
    try { await request(`campaigns/${c.id}/cancel`, "POST"); flash("Campaña cancelada"); } catch (e) { flash(errMsg(e)); }
    load();
  }
  async function remove(c: Campaign) {
    if (!await ask({ title: "Eliminar campaña", message: `Se elimina “${c.name}” y su lista de destinatarios. El historial de mensajes ya enviados se conserva en Reportes.`, confirmLabel: "Eliminar", danger: true })) return;
    try { await request(`campaigns/${c.id}`, "DELETE"); flash("Campaña eliminada"); if (detail?.campaign.id === c.id) setDetail(null); } catch (e) { flash(errMsg(e)); }
    load();
  }
  async function view(c: Campaign) { try { setDetail(await request(`campaigns/${c.id}`)); } catch (e) { flash(errMsg(e)); } }
  async function duplicate(c: Campaign) {
    try {
      const d = await request(`campaigns/${c.id}`);
      setWizard({ name: `${c.name} (copia)`, body: c.body, rows: d.recipients.map((r: any) => ({ phone: r.phone, name: r.name, variables: JSON.parse(r.variables || "{}") })) });
    } catch (e) { flash(errMsg(e)); }
  }

  const counts = useMemo(() => { const m: Record<string, number> = { all: list.length }; for (const c of list) m[c.status] = (m[c.status] || 0) + 1; return m; }, [list]);
  const shown = useMemo(() => {
    const q = query.toLowerCase();
    const f = from ? new Date(from + "T00:00:00").getTime() : 0, t = to ? new Date(to + "T23:59:59").getTime() : Infinity;
    const out = list.filter(c => (filter === "all" || c.status === filter) && (!q || c.name.toLowerCase().includes(q) || c.body.toLowerCase().includes(q)) && new Date(c.created_at).getTime() >= f && new Date(c.created_at).getTime() <= t);
    const by: Record<string, (a: Campaign, b: Campaign) => number> = { recent: (a, b) => b.created_at.localeCompare(a.created_at), old: (a, b) => a.created_at.localeCompare(b.created_at), size: (a, b) => b.total - a.total, name: (a, b) => a.name.localeCompare(b.name) };
    return out.sort(by[sort]);
  }, [list, filter, query, sort, from, to]);
  const filtered = filter !== "all" || query || from || to;

  return <div className="cx">
    <div className="dx-head"><div><span className="dx-eyebrow">Mensajes a escala</span><h1>Campañas</h1><p>Creá, programá, detené y seguí cada envío.</p></div><div className="dx-head-actions"><button className="dx-btn" onClick={() => setWizard({ name: "", body: "", rows: null })}><Plus size={16} /> Nueva campaña</button></div></div>

    <div className="cx-summary"><div><small>Campañas</small><strong>{fmt(list.length)}</strong></div><div><small>En curso</small><strong>{fmt(counts.sending || 0)}</strong></div><div><small>Programadas</small><strong>{fmt(counts.scheduled || 0)}</strong></div><div><small>Mensajes enviados</small><strong>{fmt(list.reduce((a, c) => a + c.sent, 0))}</strong></div></div>

    <div className="cx-toolbar">
      <div className="cx-pills">{FILTERS.map(([k, l]) => <button key={k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>{l}{counts[k] ? <i>{counts[k]}</i> : null}</button>)}</div>
      <div className="cx-tools">
        <div className="search-box"><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por nombre o texto" /></div>
        <label className="cx-field">Desde<input type="date" value={from} onChange={e => setFrom(e.target.value)} /></label>
        <label className="cx-field">Hasta<input type="date" value={to} onChange={e => setTo(e.target.value)} /></label>
        <label className="cx-field">Ordenar<select value={sort} onChange={e => setSort(e.target.value)}><option value="recent">Más recientes</option><option value="old">Más antiguas</option><option value="size">Más destinatarios</option><option value="name">Nombre (A–Z)</option></select></label>
        {filtered && <button className="dx-link" onClick={() => { setFilter("all"); setQuery(""); setFrom(""); setTo(""); }}>Limpiar filtros</button>}
      </div>
    </div>

    {!loaded ? <div className="cx-loading">Cargando campañas…</div> : shown.length ? <div className="cx-grid">{shown.map(c => <CampaignCard key={c.id} c={c} busy={!!running[c.id]} onView={() => view(c)} onStart={() => start(c)} onStop={() => stop(c)} onEdit={() => setEditing(c)} onDuplicate={() => duplicate(c)} onCancel={() => cancel(c)} onDelete={() => remove(c)} />)}</div>
      : <Empty title={list.length ? "Sin resultados" : "Todavía no creaste campañas"} subtitle={list.length ? "Probá con otro filtro o búsqueda." : "Elegí un mensaje, tus destinatarios y listo: en tres pasos sale tu primera campaña."} />}

    {wizard && <Wizard init={wizard} balance={balance} ask={ask} flash={flash} onClose={() => setWizard(null)} onCreated={async (id, now) => { setWizard(null); await load(); onChanged(); if (now) { const c = (await request("campaigns")).campaigns.find((x: Campaign) => x.id === id); if (c) drive(c); } }} />}
    {editing && <EditModal c={editing} flash={flash} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    {detail && <Drawer d={detail} busy={!!running[detail.campaign.id]} onClose={() => setDetail(null)} onStart={() => start(detail.campaign)} onStop={() => stop(detail.campaign)} onEdit={() => setEditing(detail.campaign)} onDuplicate={() => duplicate(detail.campaign)} onRefresh={() => view(detail.campaign)} />}
  </div>;
}

function CampaignCard({ c, busy, onView, onStart, onStop, onEdit, onDuplicate, onCancel, onDelete }: { c: Campaign; busy: boolean; onView: () => void; onStart: () => void; onStop: () => void; onEdit: () => void; onDuplicate: () => void; onCancel: () => void; onDelete: () => void }) {
  const live = c.status === "sending";
  const canStart = ["draft", "scheduled", "paused"].includes(c.status);
  const editable = ["draft", "scheduled", "paused"].includes(c.status);
  const cancellable = ["draft", "scheduled", "paused", "sending"].includes(c.status);
  return <article className={"cx-card st-" + c.status}>
    <header><div><h3>{c.name}</h3><small>{date(c.created_at)}</small></div><Status value={c.status} /></header>
    <p className="cx-body">{c.body}</p>
    <div className="cx-progress"><div className={"dx-bar" + (live ? " live" : "")}><i style={{ width: pct(c) + "%" }} /></div><span>{pct(c)}%</span></div>
    <dl className="cx-stats"><div><dt>Destinatarios</dt><dd>{fmt(c.total)}</dd></div><div><dt>Enviados</dt><dd>{fmt(c.sent)}</dd></div><div><dt>Fallidos</dt><dd>{fmt(c.failed)}</dd></div></dl>
    {c.scheduled_at && c.status === "scheduled" && <div className="cx-when"><CalendarClock size={14} /> {date(c.scheduled_at)}</div>}
    <footer>
      {live ? <button className="dx-btn sm stop" onClick={onStop}><Pause size={14} /> Detener</button> : canStart ? <button className="dx-btn sm" disabled={busy} onClick={onStart}>{c.status === "paused" ? <><Play size={14} /> Reanudar</> : <><Send size={14} /> {c.status === "scheduled" ? "Enviar ahora" : "Enviar"}</>}</button> : <button className="dx-btn ghost sm" onClick={onView}><Eye size={14} /> Ver detalle</button>}
      <div className="cx-icons">
        {(live || canStart) && <button title="Ver detalle" onClick={onView}><Eye size={16} /></button>}
        {editable && <button title="Editar" onClick={onEdit}><Pencil size={16} /></button>}
        <button title="Duplicar" onClick={onDuplicate}><Copy size={16} /></button>
        {cancellable && <button title="Cancelar campaña" onClick={onCancel}><Ban size={16} /></button>}
        {!live && <button title="Eliminar" className="danger" onClick={onDelete}><Trash2 size={16} /></button>}
      </div>
    </footer>
  </article>;
}

function Wizard({ init, balance, ask, flash, onClose, onCreated }: { init: { name: string; body: string; rows: Recipient[] | null }; balance: number; ask: Ask; flash: (s: string) => void; onClose: () => void; onCreated: (id: string, sendNow: boolean) => void }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(init.name), [body, setBody] = useState(init.body);
  const [source, setSource] = useState<"contacts" | "paste" | "file">(init.rows ? "file" : "contacts");
  const [paste, setPaste] = useState(""), [fileRows, setFileRows] = useState<Recipient[]>(init.rows || []), [fileName, setFileName] = useState(init.rows ? "Lista de la campaña original" : "");
  const [contacts, setContacts] = useState<Contact[]>([]), [optouts, setOptouts] = useState<Set<string>>(new Set());
  const [when, setWhen] = useState<"now" | "later" | "draft">("now"), [schedule, setSchedule] = useState("");
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { request("contacts").then(d => setContacts(d.contacts)).catch(() => { }); request("optouts").then(d => setOptouts(new Set(d.optouts.map((o: { phone: string }) => o.phone)))).catch(() => { }); }, []);

  const raw: Recipient[] = useMemo(() => source === "contacts" ? contacts.map(c => ({ phone: c.phone, name: c.name, variables: JSON.parse(c.variables || "{}") })) : source === "file" ? fileRows : paste.split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(line => { const [phone, n, ...rest] = line.split(/[,;\t]/); return { phone: phone?.trim() || "", name: n?.trim() || "", variables: rest.length ? { dato: rest.join(" ").trim() } : {} }; }), [source, contacts, fileRows, paste]);
  const calc = useMemo(() => {
    const seen = new Set<string>(); const valid: Recipient[] = []; let invalid = 0, dups = 0, excluded = 0;
    for (const r of raw) { const p = normalizePhone(r.phone); if (!p) { invalid++; continue; } if (seen.has(p)) { dups++; continue; } seen.add(p); if (optouts.has(p)) { excluded++; continue; } valid.push({ ...r, phone: p }); }
    const credits = valid.reduce((a, r) => a + Math.max(1, segmentsOf(renderMessage(body, { ...r.variables, nombre: r.name, numero: r.phone }))), 0);
    return { valid, invalid, dups, excluded, credits };
  }, [raw, optouts, body]);

  const sample = calc.valid[0];
  const preview = renderMessage(body, { ...(sample?.variables || {}), nombre: sample?.name || "María", numero: sample?.phone || "595981234567" });
  const tooMany = calc.valid.length > 2000, short = calc.credits > balance;
  const step1 = name.trim().length > 0 && body.trim().length > 0 && body.length <= 1000;
  const step2 = calc.valid.length > 0 && !tooMany;
  const step3 = when !== "later" || (!!schedule && new Date(schedule).getTime() > Date.now());
  const insert = (v: string) => { const el = bodyRef.current; const s = el?.selectionStart ?? body.length, e = el?.selectionEnd ?? body.length; setBody(b => b.slice(0, s) + v + b.slice(e)); setTimeout(() => { el?.focus(); el?.setSelectionRange(s + v.length, s + v.length); }); };

  async function finish() {
    if (when === "now" && short && !await ask({ title: "Saldo insuficiente", message: `Necesitás ${fmt(calc.credits)} créditos y tenés ${fmt(balance)}. La campaña se va a pausar cuando se acabe el saldo y podrás reanudarla después de recargar.`, confirmLabel: "Enviar igual" })) return;
    setBusy(true);
    try {
      const d = await request("campaigns", "POST", { name: name.trim(), body: body.trim(), scheduledAt: when === "later" ? new Date(schedule).toISOString() : null, recipients: calc.valid });
      flash(when === "later" ? "Campaña programada" : when === "draft" ? "Borrador guardado" : "Campaña creada, enviando…");
      onCreated(d.id, when === "now");
    } catch (e) { flash(errMsg(e)); setBusy(false); }
  }
  async function pickFile(f: File) { try { const rows = await parseSpreadsheet(f); setFileRows(rows); setFileName(f.name); } catch (e) { flash(errMsg(e, "No se pudo leer el archivo")); } }

  const steps = ["Mensaje", "Destinatarios", "Envío"];
  return <div className="modal-backdrop" onClick={onClose}><div className="wz" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
    <header className="wz-head"><div><h2>Nueva campaña</h2><p>Tres pasos y sale.</p></div><button className="icon-btn" onClick={onClose} aria-label="Cerrar"><X size={20} /></button></header>
    <ol className="wz-steps">{steps.map((s, i) => <li key={s} className={step === i + 1 ? "on" : step > i + 1 ? "done" : ""}><span>{step > i + 1 ? <Check size={14} /> : i + 1}</span>{s}</li>)}</ol>
    <div className="wz-body">
      <div className="wz-main">
        {step === 1 && <>
          <label className="wz-label">Nombre de la campaña<input value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Promoción de octubre" maxLength={120} autoFocus /></label>
          <label className="wz-label">Mensaje<textarea ref={bodyRef} rows={6} value={body} onChange={e => setBody(e.target.value)} placeholder="Hola {nombre}, tenemos una novedad para vos…" /></label>
          <div className="wz-chips"><span>Insertar:</span><button onClick={() => insert("{nombre}")}>{"{nombre}"}</button><button onClick={() => insert("{numero}")}>{"{numero}"}</button></div>
          <div className="form-meta"><span>{body.length}/1000 caracteres</span><span>{segmentsOf(body)} crédito(s) por mensaje</span></div>
        </>}
        {step === 2 && <>
          <div className="wz-tabs">{([["contacts", `Mis contactos (${contacts.length})`], ["paste", "Pegar lista"], ["file", "Excel / CSV"]] as const).map(([k, l]) => <button key={k} className={source === k ? "on" : ""} onClick={() => setSource(k)}>{l}</button>)}</div>
          {source === "contacts" && <div className="wz-note">Se incluyen todos los contactos de tu base. Para agregar más, importalos en la sección Contactos.</div>}
          {source === "paste" && <label className="wz-label">Un número por línea (nombre opcional)<textarea rows={7} value={paste} onChange={e => setPaste(e.target.value)} placeholder={"0981234567,María\n0982345678,Carlos"} /></label>}
          {source === "file" && <label className="wz-drop"><FileSpreadsheet size={26} /><strong>{fileName || "Elegir planilla"}</strong><span>{fileRows.length ? `${fmt(fileRows.length)} filas leídas` : "Excel o CSV con número, nombre y variables"}</span><input type="file" accept=".xlsx,.xls,.csv" onChange={e => e.target.files?.[0] && pickFile(e.target.files[0])} /></label>}
          <div className="wz-stats"><div className="ok"><strong>{fmt(calc.valid.length)}</strong><small>válidos</small></div><div><strong>{fmt(calc.invalid)}</strong><small>inválidos</small></div><div><strong>{fmt(calc.dups)}</strong><small>repetidos</small></div><div><strong>{fmt(calc.excluded)}</strong><small>excluidos</small></div></div>
          {tooMany && <div className="wz-warn">Cada campaña admite hasta 2.000 destinatarios. Dividí la lista en varias campañas.</div>}
        </>}
        {step === 3 && <>
          <div className="wz-options">
            {([["now", "Enviar ahora", "Empieza apenas confirmes."], ["later", "Programar", "Elegí día y hora de Paraguay."], ["draft", "Guardar borrador", "Lo enviás cuando quieras."]] as const).map(([k, t, d]) => <button key={k} className={when === k ? "on" : ""} onClick={() => setWhen(k)}><b>{t}</b><small>{d}</small></button>)}
          </div>
          {when === "later" && <label className="wz-label">Fecha y hora<input type="datetime-local" value={schedule} onChange={e => setSchedule(e.target.value)} /></label>}
          <div className="wz-summary"><div><span>Campaña</span><b>{name}</b></div><div><span>Destinatarios</span><b>{fmt(calc.valid.length)}</b></div><div><span>Créditos estimados</span><b>{fmt(calc.credits)}</b></div><div><span>Tu saldo</span><b className={short ? "bad" : ""}>{fmt(balance)}</b></div></div>
          {short && <div className="wz-warn">Tu saldo no alcanza para toda la lista. Podés recargar o enviar igual: la campaña se pausa sola al agotarse el saldo.</div>}
          {calc.excluded > 0 && <div className="wz-note">{fmt(calc.excluded)} número(s) de tu lista de exclusión no recibirán el mensaje.</div>}
        </>}
      </div>
      <aside className="wz-preview"><small>Vista previa</small><div className="phone-preview"><div className="phone-notch" /><div className="phone-bar">‹ <span>Mensajes</span></div><div className="sms-bubble">{preview || "Tu mensaje aparecerá aquí…"}</div><small>Mensaje de texto · ahora</small></div></aside>
    </div>
    <footer className="wz-foot"><button className="dx-btn ghost" onClick={() => step === 1 ? onClose() : setStep(step - 1)}>{step === 1 ? "Cancelar" : <><ChevronLeft size={16} /> Atrás</>}</button>
      {step < 3 ? <button className="dx-btn" disabled={step === 1 ? !step1 : !step2} onClick={() => setStep(step + 1)}>Siguiente <ChevronRight size={16} /></button>
        : <button className="dx-btn" disabled={busy || !step3} onClick={finish}>{busy ? "Guardando…" : when === "now" ? <><Send size={16} /> Enviar campaña</> : when === "later" ? <><CalendarClock size={16} /> Programar</> : "Guardar borrador"}</button>}
    </footer>
  </div></div>;
}

function EditModal({ c, flash, onClose, onSaved }: { c: Campaign; flash: (s: string) => void; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(c.name), [body, setBody] = useState(c.body), [schedule, setSchedule] = useState(toLocalInput(c.scheduled_at)), [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true);
    try { await request(`campaigns/${c.id}`, "PUT", { name, body, scheduledAt: schedule ? new Date(schedule).toISOString() : null }); flash("Campaña actualizada"); onSaved(); } catch (e) { flash(errMsg(e)); setBusy(false); }
  }
  return <div className="modal-backdrop" onClick={onClose}><div className="modal wide" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
    <h3>Editar campaña</h3><p>Podés cambiar el nombre, el mensaje y el horario. La lista de destinatarios no se modifica.</p>
    <label>Nombre<input value={name} onChange={e => setName(e.target.value)} maxLength={120} /></label>
    <label>Mensaje<textarea rows={5} value={body} onChange={e => setBody(e.target.value)} /></label>
    <label>Programar para (vacío = sin horario)<input type="datetime-local" value={schedule} onChange={e => setSchedule(e.target.value)} /></label>
    <div className="modal-actions"><button className="secondary-btn" onClick={onClose}>Cancelar</button><button className="action-btn" disabled={busy || !name.trim() || !body.trim()} onClick={save}>{busy ? "Guardando…" : "Guardar cambios"}</button></div>
  </div></div>;
}

function Drawer({ d, busy, onClose, onStart, onStop, onEdit, onDuplicate, onRefresh }: { d: { campaign: Campaign; recipients: any[] }; busy: boolean; onClose: () => void; onStart: () => void; onStop: () => void; onEdit: () => void; onDuplicate: () => void; onRefresh: () => void }) {
  const c = d.campaign;
  const [f, setF] = useState("all"), [q, setQ] = useState("");
  const groups: Record<string, (s: string) => boolean> = { all: () => true, ok: s => s === "aceptado" || s === "simulado", failed: s => s === "failed", pending: s => s === "pending" || s === "processing" };
  const rows = d.recipients.filter(r => groups[f](r.status) && (`${r.phone} ${r.name}`.toLowerCase().includes(q.toLowerCase())));
  const n = (k: string) => d.recipients.filter(r => groups[k](r.status)).length;
  useEffect(() => { if (c.status !== "sending") return; const t = setInterval(onRefresh, 4000); return () => clearInterval(t); }, [c.status, onRefresh]);
  return <div className="drawer-backdrop" onClick={onClose}><aside className="drawer" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
    <header><div><h2>{c.name}</h2><div className="drawer-meta"><Status value={c.status} /><small>Creada {date(c.created_at)}</small></div></div><button className="icon-btn" onClick={onClose} aria-label="Cerrar"><X size={20} /></button></header>
    <p className="cx-body full">{c.body}</p>
    <div className="cx-progress"><div className={"dx-bar" + (c.status === "sending" ? " live" : "")}><i style={{ width: pct(c) + "%" }} /></div><span>{pct(c)}%</span></div>
    <div className="drawer-actions">
      {c.status === "sending" ? <button className="dx-btn sm stop" onClick={onStop}><Pause size={14} /> Detener</button> : ["draft", "scheduled", "paused"].includes(c.status) && <button className="dx-btn sm" disabled={busy} onClick={onStart}><Play size={14} /> {c.status === "paused" ? "Reanudar" : "Enviar"}</button>}
      {["draft", "scheduled", "paused"].includes(c.status) && <button className="dx-btn ghost sm" onClick={onEdit}><Pencil size={14} /> Editar</button>}
      <button className="dx-btn ghost sm" onClick={onDuplicate}><Copy size={14} /> Duplicar</button>
    </div>
    <div className="cx-pills sm">{([["all", "Todos"], ["ok", "Enviados"], ["failed", "Fallidos"], ["pending", "Pendientes"]] as const).map(([k, l]) => <button key={k} className={f === k ? "on" : ""} onClick={() => setF(k)}>{l}<i>{n(k)}</i></button>)}</div>
    <div className="search-box drawer-search"><Search size={16} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar número o nombre" /></div>
    <div className="drawer-table">{rows.length ? <Table><TableHeader><TableRow><TableHead>Número</TableHead><TableHead>Nombre</TableHead><TableHead>Estado</TableHead><TableHead>Detalle</TableHead></TableRow></TableHeader><TableBody>{rows.map(r => <TableRow key={r.id}><TableCell>+{r.phone}</TableCell><TableCell>{r.name || "—"}</TableCell><TableCell><Status value={r.status} /></TableCell><TableCell>{r.error || "—"}</TableCell></TableRow>)}</TableBody></Table> : <Empty title="Sin resultados" subtitle="No hay destinatarios con ese filtro." />}</div>
  </aside></div>;
}
