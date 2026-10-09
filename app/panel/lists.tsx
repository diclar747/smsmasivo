/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownToLine, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CreditCard, ExternalLink, Search, ShieldCheck, Trash2, X } from "lucide-react";
import { GroupsBar, createGroupDialog } from "./groups";
import { type Ask, type Contact, type Group, Empty, Status, date, fmt, request } from "./shared";

const SIZES = [15, 30, 50, 100];
const errMsg = (e: unknown) => e instanceof Error ? e.message : "Ocurrió un error";

function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

/** Carga una lista paginada desde el servidor; vuelve a pedir cuando cambian los filtros o la página. */
function useServerList<T = any>(path: string, params: Record<string, string>, page: number, size: number, reloadKey: unknown) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const seq = useRef(0);
  const key = JSON.stringify(params);
  const load = useCallback(async () => {
    const n = ++seq.current;
    setLoading(true);
    try {
      const qs = new URLSearchParams({ ...JSON.parse(key), page: String(page), pageSize: String(size) });
      const d = await request(`${path}?${qs}`);
      if (n === seq.current) { setData(d); setError(""); }
    } catch (e) { if (n === seq.current) setError(errMsg(e)); }
    finally { if (n === seq.current) setLoading(false); }
  }, [path, key, page, size]);
  useEffect(() => { load(); }, [load, reloadKey]);
  return { data, loading, error, reload: load };
}

export function Pager({ page, size, total, onPage, onSize }: { page: number; size: number; total: number; onPage: (p: number) => void; onSize: (s: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / size));
  const from = total ? (page - 1) * size + 1 : 0, to = Math.min(total, page * size);
  const nums: (number | "…")[] = [];
  for (let i = 1; i <= pages; i++) if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i); else if (nums[nums.length - 1] !== "…") nums.push("…");
  return <div className="dt-pager">
    <span className="dt-count">{total ? `${fmt(from)}–${fmt(to)} de ${fmt(total)}` : "Sin resultados"}</span>
    <div className="dt-pages">
      <button disabled={page <= 1} onClick={() => onPage(1)} aria-label="Primera página"><ChevronsLeft size={16} /></button>
      <button disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Anterior"><ChevronLeft size={16} /></button>
      {nums.map((n, i) => n === "…" ? <span key={"e" + i} className="dt-gap">…</span> : <button key={n} className={n === page ? "on" : ""} onClick={() => onPage(n)}>{n}</button>)}
      <button disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Siguiente"><ChevronRight size={16} /></button>
      <button disabled={page >= pages} onClick={() => onPage(pages)} aria-label="Última página"><ChevronsRight size={16} /></button>
    </div>
    <label className="dt-size">Filas<select value={size} onChange={e => onSize(Number(e.target.value))}>{SIZES.map(s => <option key={s} value={s}>{s}</option>)}</select></label>
  </div>;
}

function Chip({ label, value, tone }: { label: string; value: string | number; tone?: string }) { return <div className={"dt-chip " + (tone || "")}><small>{label}</small><strong>{typeof value === "number" ? fmt(value) : value}</strong></div>; }
const SearchBox = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) => <div className="search-box dt-search"><Search size={16} /><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />{value && <button onClick={() => onChange("")} aria-label="Borrar búsqueda"><X size={14} /></button>}</div>;

/* ------------------------------------------------------------------ Reportes */
export function ReportsView({ ask, flash }: { ask: Ask; flash: (s: string) => void }) {
  const [q, setQ] = useState(""), [from, setFrom] = useState(""), [to, setTo] = useState(""), [campaign, setCampaign] = useState(""), [status, setStatus] = useState("");
  const [page, setPage] = useState(1), [size, setSize] = useState(15), [sel, setSel] = useState<Set<string>>(new Set());
  const [campaigns, setCampaigns] = useState<{ id: string; name: string }[]>([]);
  const dq = useDebounced(q);
  const params = useMemo(() => { const p: Record<string, string> = {}; if (dq) p.q = dq; if (from) p.from = from; if (to) p.to = to; if (campaign) p.campaign = campaign; if (status) p.status = status; return p; }, [dq, from, to, campaign, status]);
  const { data, loading, error, reload } = useServerList<any>("reports", params, page, size, 0);
  useEffect(() => { request("campaigns").then(d => setCampaigns(d.campaigns)).catch(() => { }); }, []);
  useEffect(() => { setPage(1); setSel(new Set()); }, [params]);
  useEffect(() => { setSel(new Set()); }, [page, size]);
  const rows: any[] = data?.messages || [], total: number = data?.total || 0, sum = data?.summary || { ok: 0, failed: 0, credits: 0 };
  const filtered = Object.keys(params).length > 0;
  const allOn = rows.length > 0 && rows.every(r => sel.has(r.id));
  const clearFilters = () => { setQ(""); setFrom(""); setTo(""); setCampaign(""); setStatus(""); };
  const toggle = (id: string) => setSel(s => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  async function del(body: unknown, title: string, message: string, label: string) {
    if (!await ask({ title, message, confirmLabel: label, danger: true })) return;
    try { const d = await request("reports/delete", "POST", body); flash(`${fmt(d.deleted)} mensaje(s) eliminado(s) del historial`); setSel(new Set()); if (page > 1 && rows.length <= d.deleted) setPage(page - 1); else reload(); } catch (e) { flash(errMsg(e)); }
  }
  async function exportCsv() {
    try {
      const qs = new URLSearchParams({ ...params, page: "1", pageSize: "5000" });
      const d = await request(`reports?${qs}`);
      const header = ["fecha", "telefono", "mensaje", "estado", "creditos", "campana", "detalle"];
      const esc = (x: unknown) => `"${String(x ?? "").replaceAll('"', '""')}"`;
      const csv = [header.join(","), ...d.messages.map((m: any) => [m.created_at, m.phone, m.body, m.status, m.segments, m.campaign_name || (m.campaign_id ? "Campaña eliminada" : "Individual"), m.error || ""].map(esc).join(","))].join("\r\n");
      const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿", csv], { type: "text/csv" })); a.download = "reporte-sms.csv"; a.click(); URL.revokeObjectURL(a.href);
      flash(`${fmt(d.messages.length)} filas exportadas${d.total > 5000 ? " (máximo 5.000 por archivo; filtrá para exportar el resto)" : ""}`);
    } catch (e) { flash(errMsg(e)); }
  }

  return <div className="dx">
    <div className="dx-head"><div><span className="dx-eyebrow">Analítica</span><h1>Reportes</h1><p>Historial de cada mensaje. “Aceptado” significa que el proveedor lo recibió; la confirmación de entrega final al celular no está disponible.</p></div>
      <div className="dx-head-actions"><button className="dx-btn ghost" onClick={exportCsv} disabled={!total}><ArrowDownToLine size={16} /> Exportar CSV</button></div></div>
    <div className="dt-chips"><Chip label="Mensajes" value={total} /><Chip label="Aceptados / simulados" value={sum.ok} tone="ok" /><Chip label="Fallidos" value={sum.failed} tone={sum.failed ? "bad" : ""} /><Chip label="Créditos usados" value={sum.credits} /></div>
    <section className="dt">
      <div className="dt-filters">
        <SearchBox value={q} onChange={setQ} placeholder="Buscar número, mensaje, campaña, error…" />
        <label>Desde<input type="date" value={from} onChange={e => setFrom(e.target.value)} /></label>
        <label>Hasta<input type="date" value={to} onChange={e => setTo(e.target.value)} /></label>
        <label>Campaña<select value={campaign} onChange={e => setCampaign(e.target.value)}><option value="">Todas</option><option value="none">Envíos individuales</option>{campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label>Estado<select value={status} onChange={e => setStatus(e.target.value)}><option value="">Todos</option><option value="aceptado">Aceptado</option><option value="simulado">Simulado</option><option value="fallido">Fallido</option></select></label>
        {filtered && <button className="dx-link" onClick={clearFilters}>Limpiar filtros</button>}
      </div>
      <div className="dt-actions">
        {sel.size > 0 && <button className="dx-btn danger sm" onClick={() => del({ ids: [...sel] }, "Eliminar mensajes", `Se eliminan ${fmt(sel.size)} mensaje(s) seleccionados del historial. No se devuelven créditos.`, "Eliminar")}><Trash2 size={14} /> Eliminar seleccionados ({sel.size})</button>}
        {filtered && total > 0 && <button className="dx-btn danger sm" onClick={() => del({ all: true, filters: params }, "Eliminar resultados", `Se eliminan los ${fmt(total)} mensajes que coinciden con los filtros actuales. No se devuelven créditos.`, "Eliminar resultados")}><Trash2 size={14} /> Eliminar resultados ({fmt(total)})</button>}
        <button className="dx-btn danger sm" onClick={() => del({ all: true, filters: {} }, "Vaciar historial de envíos", "Se elimina TODO el historial de mensajes de tu cuenta. Tu saldo y las campañas no cambian. No se puede deshacer.", "Vaciar historial")}><Trash2 size={14} /> Vaciar historial</button>
      </div>
      {error && <div className="dt-error">{error} <button onClick={reload}>Reintentar</button></div>}
      <div className={"dt-wrap" + (loading ? " loading" : "")}>
        {rows.length ? <table className="dt-table"><thead><tr><th className="chk"><input type="checkbox" checked={allOn} onChange={() => setSel(allOn ? new Set() : new Set(rows.map(r => r.id)))} aria-label="Seleccionar todos" /></th><th>Fecha</th><th>Número</th><th>Mensaje</th><th>Campaña</th><th>Estado</th><th className="num">Créditos</th><th /></tr></thead>
          <tbody>{rows.map(m => <tr key={m.id} className={sel.has(m.id) ? "sel" : ""}>
            <td className="chk"><input type="checkbox" checked={sel.has(m.id)} onChange={() => toggle(m.id)} aria-label="Seleccionar" /></td>
            <td className="nowrap">{date(m.created_at)}</td><td className="nowrap">+{m.phone}</td>
            <td className="msg" title={m.body}>{m.body}{m.error && <small className="err">{m.error}</small>}</td>
            <td>{m.campaign_name || (m.campaign_id ? <em>Campaña eliminada</em> : "Individual")}</td>
            <td><Status value={m.status} /></td><td className="num">{m.segments}</td>
            <td className="act"><button title="Eliminar" onClick={() => del({ ids: [m.id] }, "Eliminar mensaje", `Se elimina el mensaje a +${m.phone} del historial.`, "Eliminar")}><Trash2 size={15} /></button></td>
          </tr>)}</tbody></table>
          : <Empty title={loading ? "Cargando…" : filtered ? "Sin resultados" : "Todavía no hay mensajes"} subtitle={filtered ? "Probá con otros filtros o limpiá la búsqueda." : "Cuando envíes SMS, vas a ver cada uno acá."} />}
      </div>
      <Pager page={page} size={size} total={total} onPage={setPage} onSize={s => { setSize(s); setPage(1); }} />
    </section>
  </div>;
}

/* ---------------------------------------------------------------- Movimientos */
export function LedgerPanel({ ask, flash, reloadKey }: { ask: Ask; flash: (s: string) => void; reloadKey: unknown }) {
  const [q, setQ] = useState(""), [from, setFrom] = useState(""), [to, setTo] = useState(""), [type, setType] = useState("");
  const [page, setPage] = useState(1), [size, setSize] = useState(15);
  const dq = useDebounced(q);
  const params = useMemo(() => { const p: Record<string, string> = {}; if (dq) p.q = dq; if (from) p.from = from; if (to) p.to = to; if (type) p.type = type; return p; }, [dq, from, to, type]);
  const { data, loading, error, reload } = useServerList<any>("wallet/ledger", params, page, size, reloadKey);
  useEffect(() => { setPage(1); }, [params]);
  const rows: any[] = data?.entries || [], total: number = data?.total || 0, sum = data?.summary || { credited: 0, spent: 0 };
  const filtered = Object.keys(params).length > 0;
  const concept = (e: any) => /^Campaña /.test(e.reason) ? <>Campaña {e.campaign_name ? <b>“{e.campaign_name}”</b> : <em>eliminada</em>}{e.n > 1 && <small> · {fmt(e.n)} mensajes</small>}</> : e.reason;
  async function clear() {
    if (!await ask({ title: "Vaciar movimientos", message: "Se elimina todo el historial de movimientos. Tu saldo actual NO cambia (se guarda aparte), pero se pierde el detalle de compras y consumos.", confirmLabel: "Vaciar movimientos", danger: true })) return;
    try { const d = await request("wallet/ledger/clear", "POST"); flash(`${fmt(d.deleted)} movimientos eliminados`); setPage(1); reload(); } catch (e) { flash(errMsg(e)); }
  }
  return <section className="dt panel-like">
    <header className="dt-title"><div><h2>Movimientos</h2><p>Compras, envíos y ajustes de saldo. Los envíos de una campaña se agrupan por hora.</p></div><button className="dx-btn danger sm" onClick={clear} disabled={!total && !filtered}><Trash2 size={14} /> Vaciar movimientos</button></header>
    <div className="dt-chips sm"><Chip label="Acreditados" value={sum.credited} tone="ok" /><Chip label="Consumidos" value={sum.spent} /></div>
    <div className="dt-filters">
      <SearchBox value={q} onChange={setQ} placeholder="Buscar concepto o campaña…" />
      <label>Desde<input type="date" value={from} onChange={e => setFrom(e.target.value)} /></label>
      <label>Hasta<input type="date" value={to} onChange={e => setTo(e.target.value)} /></label>
      <label>Tipo<select value={type} onChange={e => setType(e.target.value)}><option value="">Todos</option><option value="in">Ingresos (+)</option><option value="out">Consumos (−)</option></select></label>
      {filtered && <button className="dx-link" onClick={() => { setQ(""); setFrom(""); setTo(""); setType(""); }}>Limpiar filtros</button>}
    </div>
    {error && <div className="dt-error">{error} <button onClick={reload}>Reintentar</button></div>}
    <div className={"dt-wrap" + (loading ? " loading" : "")}>
      {rows.length ? <table className="dt-table"><thead><tr><th>Fecha</th><th>Concepto</th><th className="num">Créditos</th></tr></thead>
        <tbody>{rows.map(e => <tr key={e.id}><td className="nowrap">{date(e.created_at)}</td><td>{concept(e)}</td><td className={"num " + (e.delta > 0 ? "pos" : "neg")}>{e.delta > 0 ? "+" : ""}{fmt(e.delta)}</td></tr>)}</tbody></table>
        : <Empty title={loading ? "Cargando…" : filtered ? "Sin resultados" : "Sin movimientos"} subtitle={filtered ? "Probá con otros filtros." : "Los cambios en tu saldo aparecerán acá."} />}
    </div>
    <Pager page={page} size={size} total={total} onPage={setPage} onSize={s => { setSize(s); setPage(1); }} />
  </section>;
}

/* -------------------------------------------------------------------- Compras */
export function OrdersPanel({ ask, flash, reloadKey, onChanged }: { ask: Ask; flash: (s: string) => void; reloadKey: unknown; onChanged: () => void }) {
  const [q, setQ] = useState(""), [from, setFrom] = useState(""), [to, setTo] = useState(""), [status, setStatus] = useState("");
  const [page, setPage] = useState(1), [size, setSize] = useState(15), [tick, setTick] = useState(0);
  const dq = useDebounced(q);
  const params = useMemo(() => { const p: Record<string, string> = {}; if (dq) p.q = dq; if (from) p.from = from; if (to) p.to = to; if (status) p.status = status; return p; }, [dq, from, to, status]);
  const { data, loading, error, reload } = useServerList<any>("orders", params, page, size, `${reloadKey}-${tick}`);
  useEffect(() => { setPage(1); }, [params]);
  const rows: any[] = data?.orders || [], total: number = data?.total || 0, sum = data?.summary || { paid: 0, credits: 0 };
  const filtered = Object.keys(params).length > 0;
  async function verify(o: any) { try { const d = await request(`orders/${o.id}/verify`, "POST"); flash(d.status === "paid" ? "Pago confirmado y créditos acreditados" : "El pago todavía no está confirmado"); setTick(t => t + 1); if (d.status === "paid") onChanged(); } catch (e) { flash(errMsg(e)); } }
  async function remove(o: any) { if (!await ask({ title: "Eliminar compra", message: "Se elimina esta compra no pagada de la lista.", confirmLabel: "Eliminar", danger: true })) return; try { await request(`orders/${o.id}`, "DELETE"); reload(); onChanged(); } catch (e) { flash(errMsg(e)); } }
  async function clear() { if (!await ask({ title: "Limpiar compras no pagadas", message: "Se eliminan las compras pendientes o canceladas. Las compras pagadas se conservan como comprobante.", confirmLabel: "Limpiar", danger: true })) return; try { const d = await request("orders/clear", "POST"); flash(`${fmt(d.deleted)} compras eliminadas`); reload(); onChanged(); } catch (e) { flash(errMsg(e)); } }
  return <section className="dt panel-like">
    <header className="dt-title"><div><h2>Compras</h2><p>Si pagaste y el saldo no llegó, tocá “Verificar pago”.</p></div><button className="dx-btn danger sm" onClick={clear}><Trash2 size={14} /> Limpiar no pagadas</button></header>
    <div className="dt-chips sm"><Chip label="Compras" value={total} /><Chip label="Pagado (Gs.)" value={sum.paid} tone="ok" /><Chip label="Créditos comprados" value={sum.credits} /></div>
    <div className="dt-filters">
      <SearchBox value={q} onChange={setQ} placeholder="Buscar por monto, créditos o código…" />
      <label>Desde<input type="date" value={from} onChange={e => setFrom(e.target.value)} /></label>
      <label>Hasta<input type="date" value={to} onChange={e => setTo(e.target.value)} /></label>
      <label>Estado<select value={status} onChange={e => setStatus(e.target.value)}><option value="">Todos</option><option value="paid">Pagada</option><option value="pending">Pendiente</option></select></label>
      {filtered && <button className="dx-link" onClick={() => { setQ(""); setFrom(""); setTo(""); setStatus(""); }}>Limpiar filtros</button>}
    </div>
    {error && <div className="dt-error">{error} <button onClick={reload}>Reintentar</button></div>}
    <div className={"dt-wrap" + (loading ? " loading" : "")}>
      {rows.length ? <table className="dt-table"><thead><tr><th>Fecha</th><th>Código</th><th className="num">Créditos</th><th className="num">Monto</th><th>Estado</th><th /></tr></thead>
        <tbody>{rows.map(o => <tr key={o.id}><td className="nowrap">{date(o.created_at)}</td><td><code>{o.id.slice(0, 8)}</code></td><td className="num">{fmt(o.credits)}</td><td className="num">Gs. {fmt(o.price)}</td><td><Status value={o.status} /></td>
          <td className="act wide">{o.status === "pending" && <>{o.payment_url && <a className="dx-btn ghost sm" href={o.payment_url} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Pagar</a>}<button className="dx-btn ghost sm" onClick={() => verify(o)}><ShieldCheck size={14} /> Verificar pago</button></>}{o.status !== "paid" && <button title="Eliminar" onClick={() => remove(o)}><Trash2 size={15} /></button>}</td></tr>)}</tbody></table>
        : <Empty title={loading ? "Cargando…" : filtered ? "Sin resultados" : "Aún no hay compras"} subtitle={filtered ? "Probá con otros filtros." : "Tus recargas aparecerán acá."} />}
    </div>
    <Pager page={page} size={size} total={total} onPage={setPage} onSize={s => { setSize(s); setPage(1); }} />
    <div className="dt-foot"><CreditCard size={14} /> Los pagos se acreditan solos apenas Winsap confirma el cobro.</div>
  </section>;
}

/* ------------------------------------------------------------------ Contactos */
export function ContactsList({ contacts, groups, ask, flash, onChanged }: { contacts: Contact[]; groups: Group[]; ask: Ask; flash: (s: string) => void; onChanged: () => void }) {
  const [active, setActive] = useState<string | null>(null);
  const activeGroup = groups.find(g => g.id === active) || null;
  const base = useMemo(() => activeGroup ? contacts.filter(c => c.group_ids?.includes(activeGroup.id)) : contacts, [contacts, activeGroup]);
  const gname = useMemo(() => new Map(groups.map(g => [g.id, g.name])), [groups]);
  const [q, setQ] = useState(""), [page, setPage] = useState(1), [size, setSize] = useState(15), [sel, setSel] = useState<Set<string>>(new Set());
  const dq = useDebounced(q, 200);
  const list = useMemo(() => { const t = dq.trim().toLowerCase(), d = dq.replace(/\D/g, ""); return t ? base.filter(c => `${c.name} ${c.phone} ${c.variables}`.toLowerCase().includes(t) || (d.length >= 3 && c.phone.includes(d.replace(/^0/, "")))) : base; }, [base, dq]);
  useEffect(() => { setPage(1); setSel(new Set()); }, [dq, size, active]);
  const pages = Math.max(1, Math.ceil(list.length / size)), cur = Math.min(page, pages);
  const rows = list.slice((cur - 1) * size, cur * size);
  const allOn = rows.length > 0 && rows.every(r => sel.has(r.id));
  const toggle = (id: string) => setSel(s => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  async function del(body: unknown, title: string, message: string, label: string) {
    if (!await ask({ title, message, confirmLabel: label, danger: true })) return;
    try { const d = await request("contacts/delete", "POST", body); flash(`${fmt(d.deleted)} contacto(s) eliminado(s)`); setSel(new Set()); onChanged(); } catch (e) { flash(errMsg(e)); }
  }
  async function addToGroup(groupId: string) {
    let gid = groupId;
    if (gid === "__new") { const g = await createGroupDialog(ask, flash); if (!g) return; gid = g.id; }
    try { const d = await request(`groups/${gid}/members`, "POST", { ids: [...sel] }); flash(`${fmt(d.added)} contacto(s) agregados al grupo`); setSel(new Set()); onChanged(); } catch (e) { flash(errMsg(e)); }
  }
  async function removeFromGroup() {
    if (!activeGroup) return;
    try { const d = await request(`groups/${activeGroup.id}/remove`, "POST", { ids: [...sel] }); flash(`${fmt(d.removed)} contacto(s) quitados del grupo`); setSel(new Set()); onChanged(); } catch (e) { flash(errMsg(e)); }
  }
  return <section className="dt panel-like">
    <header className="dt-title"><div><h2>{activeGroup ? activeGroup.name : "Base de contactos"}</h2><p>{activeGroup ? `${fmt(base.length)} contacto(s) en este grupo.` : "Tu lista guardada para futuras campañas."}</p></div>
      <div className="dt-actions inline">{sel.size > 0 && <select className="grp-assign" value="" onChange={e => e.target.value && addToGroup(e.target.value)} aria-label="Agregar seleccionados a un grupo"><option value="">Agregar a grupo ({sel.size})</option>{groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}<option value="__new">+ Nuevo grupo…</option></select>}{sel.size > 0 && activeGroup && <button className="dx-btn ghost sm" onClick={removeFromGroup}>Quitar del grupo</button>}{sel.size > 0 && <button className="dx-btn danger sm" onClick={() => del({ ids: [...sel] }, "Eliminar contactos", `Se eliminan ${fmt(sel.size)} contacto(s) seleccionados.`, "Eliminar")}><Trash2 size={14} /> Eliminar seleccionados ({sel.size})</button>}{!activeGroup && <button className="dx-btn danger sm" disabled={!contacts.length} onClick={() => del({ all: true }, "Vaciar contactos", `Se eliminan los ${fmt(contacts.length)} contactos de tu base. No se puede deshacer.`, "Vaciar contactos")}><Trash2 size={14} /> Vaciar lista</button>}</div></header>
    <GroupsBar groups={groups} active={active} onActive={setActive} total={contacts.length} ask={ask} flash={flash} onChanged={onChanged} />
    <div className="dt-filters"><SearchBox value={q} onChange={setQ} placeholder="Buscar nombre, número o dato…" />{q && <button className="dx-link" onClick={() => setQ("")}>Limpiar</button>}</div>
    <div className="dt-wrap">
      {rows.length ? <table className="dt-table"><thead><tr><th className="chk"><input type="checkbox" checked={allOn} onChange={() => setSel(allOn ? new Set() : new Set(rows.map(r => r.id)))} aria-label="Seleccionar todos" /></th><th>Nombre</th><th>Número</th><th>Variables</th><th>Agregado</th><th /></tr></thead>
        <tbody>{rows.map(c => { let vars: string[] = []; try { vars = Object.keys(JSON.parse(c.variables || "{}")); } catch { /* sin variables */ } return <tr key={c.id} className={sel.has(c.id) ? "sel" : ""}><td className="chk"><input type="checkbox" checked={sel.has(c.id)} onChange={() => toggle(c.id)} aria-label="Seleccionar" /></td><td><b>{c.name || "Sin nombre"}</b>{!!c.group_ids?.length && <div className="grp-tags">{c.group_ids.map(g => gname.get(g) && <span key={g}>{gname.get(g)}</span>)}</div>}</td><td className="nowrap">+{c.phone}</td><td>{vars.join(", ") || "—"}</td><td className="nowrap">{date(c.created_at)}</td><td className="act"><button title="Eliminar" onClick={() => del({ ids: [c.id] }, "Eliminar contacto", `Se elimina a ${c.name || "+" + c.phone}.`, "Eliminar")}><Trash2 size={15} /></button></td></tr>; })}</tbody></table>
        : <Empty title={base.length ? "Sin resultados" : activeGroup ? "Este grupo está vacío" : contacts.length ? "Sin resultados" : "Tu base está vacía"} subtitle={base.length ? "Probá con otra búsqueda." : activeGroup ? "Marcá contactos en Todos y agregalos a este grupo, o importá una lista directo al grupo." : contacts.length ? "Probá con otra búsqueda." : "Importá un archivo o pegá números arriba."} />}
    </div>
    <Pager page={cur} size={size} total={list.length} onPage={setPage} onSize={setSize} />
  </section>;
}
