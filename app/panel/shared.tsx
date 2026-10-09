import { prepareSms, smsProblem } from "@/lib/sms-text";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { MessageSquareText } from "lucide-react";

export type User = { id: string; name: string; email: string; role: string; status: string; balance: number; avatar?: string | null };
export type Contact = { id: string; phone: string; name: string; variables: string; created_at: string };
export type Campaign = { id: string; name: string; body: string; status: string; total: number; sent: number; failed: number; scheduled_at: string | null; created_at: string };
export type Message = { id: string; phone: string; body: string; status: string; segments: number; campaign_id: string | null; created_at: string };
export type Package = { id: string; credits: number; price: number; active: number };
export type Recipient = { phone: string; name: string; variables: Record<string, string> };
export type Dialog = { title: string; message?: string; confirmLabel?: string; danger?: boolean; input?: { label: string; initial?: string }; code?: string; hideCancel?: boolean; resolve: (v: string | boolean | null) => void };
export type Ask = (o: Omit<Dialog, "resolve">) => Promise<string | boolean | null>;

export const fmt = (n: number) => new Intl.NumberFormat("es-PY").format(n || 0);
export const date = (v: string | null) => v ? new Date(v).toLocaleString("es-PY", { dateStyle: "short", timeStyle: "short", timeZone: "America/Asuncion" }) : "—";
export const pct = (c: Campaign) => c.total ? Math.round((c.sent + c.failed) / c.total * 100) : 0;
export const statusText: Record<string, string> = { draft: "Borrador", scheduled: "Programada", sending: "Enviando", paused: "Pausada", completed: "Completada", cancelled: "Cancelada", accepted: "Aceptado", aceptado: "Aceptado", simulado: "Simulado", failed: "Fallido", fallido: "Fallido", pending: "Pendiente", processing: "Procesando", paid: "Pagado", active: "Activo", disabled: "Desactivado" };

export async function request(path: string, method = "GET", payload?: unknown): Promise<any> {
  const r = await fetch(`/api/${path}`, { method, headers: payload ? { "Content-Type": "application/json" } : {}, body: payload ? JSON.stringify(payload) : undefined, cache: "no-store" });
  let d: any;
  try { d = await r.json(); } catch { throw new Error("Respuesta inválida del servidor"); }
  if (!r.ok) throw new Error(d.error || "No se pudo completar la operación");
  return d;
}

async function loadXlsx(): Promise<any> {
  const browser = window as unknown as { XLSX?: any };
  if (browser.XLSX) return browser.XLSX;
  await new Promise<void>((resolve, reject) => { const script = document.createElement("script"); script.src = "/vendor/xlsx.min.js"; script.onload = () => resolve(); script.onerror = () => reject(new Error("No se pudo cargar el lector de Excel")); document.head.appendChild(script); });
  if (!browser.XLSX) throw new Error("No se pudo iniciar el lector de Excel");
  return browser.XLSX;
}

/** Lee la primera hoja de un Excel/CSV. Detecta si no hay encabezados (primera columna = número). */
export async function parseSpreadsheet(file: File): Promise<Recipient[]> {
  const XLSX = await loadXlsx();
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const cells: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  const first = String(cells[0]?.[0] ?? "").replace(/\D/g, "");
  if (/^(595)?0?9\d{8}$/.test(first)) return cells.map(row => ({ phone: String(row[0] ?? ""), name: String(row[1] ?? ""), variables: {} })).filter(x => x.phone);
  const raw: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  return raw.map(row => {
    const keys = Object.keys(row);
    const phoneKey = keys.find(k => /tel|cel|n[uú]m|phone|whatsapp/i.test(k)) || keys[0];
    const nameKey = keys.find(k => /nombre|name/i.test(k));
    const variables: Record<string, string> = {};
    for (const k of keys) if (k !== phoneKey && k !== nameKey) variables[k.toLowerCase().replace(/\s+/g, "_")] = String(row[k] ?? "");
    return { phone: String(row[phoneKey] ?? ""), name: nameKey ? String(row[nameKey] ?? "") : "", variables };
  }).filter(x => x.phone);
}

/** Espejo de la lógica del servidor para estimar costos y validar números antes de enviar. */
export function normalizePhone(input: unknown) {
  const digits = String(input ?? "").replace(/\D/g, "");
  const phone = digits.startsWith("595") ? digits : digits.startsWith("0") ? `595${digits.slice(1)}` : `595${digits}`;
  return /^5959\d{8}$/.test(phone) ? phone : null;
}
export const renderMessage = (body: string, row: Record<string, unknown>) => body.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) => String(row[key] ?? ""));
export function segmentsOf(body: string) {
  return prepareSms(body).text ? 1 : 0; // siempre 1 SMS: lo que pase de 160 caracteres se rechaza
}
/** Motivo por el que el texto no se puede enviar (null si está bien). */
export const smsIssue = (body: string) => smsProblem(prepareSms(body));

export function Status({ value }: { value: string }) { return <span className={`status status-${value}`}>{statusText[value] || value}</span>; }
export function Empty({ title, subtitle }: { title: string; subtitle: string }) { return <div className="empty-state"><div className="empty-icon"><MessageSquareText size={24} /></div><strong>{title}</strong><p>{subtitle}</p></div>; }
