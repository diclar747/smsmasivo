/* Exportación del historial de una campaña: Excel (.xlsx), PDF descargable e impresión. */
import { type Campaign, date, loadXlsx, statusText } from "./shared";

export type ExportRow = { phone: string; name?: string | null; status: string; error?: string | null; sent_at?: string | null };
type Report = { campaign: Campaign; rows: ExportRow[]; filter: string };

const HEAD = ["Número", "Nombre", "Estado", "Detalle", "Enviado"];
const cells = (r: ExportRow) => [`+${r.phone}`, r.name || "—", statusText[r.status] || r.status, r.error || "—", r.sent_at ? date(r.sent_at) : "—"];
const meta = ({ campaign: c, rows, filter }: Report): [string, string][] => [
  ["Campaña", c.name], ["Mensaje", c.body], ["Estado", statusText[c.status] || c.status], ["Creada", date(c.created_at)],
  ["Destinatarios", `${c.total} en total · ${c.sent} enviados · ${c.failed} fallidos`], ["Filtro", `${filter} (${rows.length})`],
  ["Generado", date(new Date().toISOString())],
];
const fileBase = (c: Campaign) => `campana-${c.name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "sms"}-${new Date().toISOString().slice(0, 10)}`;

function download(blob: Blob, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/* ---------------------------------------------------------------- Excel --- */
export async function exportExcel(rep: Report) {
  const XLSX = await loadXlsx();
  const aoa: (string | number)[][] = [["SMS Masivo · Historial de campaña"], [], ...meta(rep), [], HEAD, ...rep.rows.map(cells)];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [{ wch: 16 }, { wch: 26 }, { wch: 13 }, { wch: 48 }, { wch: 18 }];
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];
  const headerRow = meta(rep).length + 3; // fila de la tabla (base 0)
  ws["!autofilter"] = { ref: XLSX.utils.encode_range({ s: { r: headerRow, c: 0 }, e: { r: headerRow + rep.rows.length, c: 4 } }) };
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Historial");
  XLSX.writeFile(wb, `${fileBase(rep.campaign)}.xlsx`, { compression: true });
}

/* ------------------------------------------------------------------ PDF --- */
// PDF mínimo (A4, Helvetica WinAnsi): texto y tablas sin librerías externas.
const CP1252: Record<string, number> = { "€": 0x80, "‚": 0x82, "„": 0x84, "…": 0x85, "‘": 0x91, "’": 0x92, "“": 0x93, "”": 0x94, "•": 0x95, "–": 0x96, "—": 0x97, "™": 0x99 };
const enc = (s: string) => Array.from(s.replace(/\s+/g, " "), ch => {
  const code = ch.charCodeAt(0);
  const b = CP1252[ch] ?? (code < 256 ? code : 63); // ? para lo que WinAnsi no tiene (p. ej. emojis)
  const c = String.fromCharCode(b);
  return c === "(" || c === ")" || c === "\\" ? "\\" + c : c;
}).join("");
const fit = (s: string, width: number, size: number) => {
  const max = Math.max(3, Math.floor(width / (size * 0.53)));
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
};

export function buildPdf(rep: Report): Uint8Array {
  const W = 595.28, H = 841.89, M = 40;
  const cols = [92, 112, 58, 141, 112]; // suma = 515 = ancho útil
  const pages: string[] = [];
  let ops = "", y = 0;
  const text = (x: number, yy: number, s: string, size = 9, bold = false, rgb = "0.10 0.13 0.22") =>
    { ops += `BT ${rgb} rg /${bold ? "F2" : "F1"} ${size} Tf ${x.toFixed(2)} ${yy.toFixed(2)} Td (${enc(s)}) Tj ET\n`; };
  const rect = (x: number, yy: number, w: number, h: number, rgb: string) => { ops += `${rgb} rg ${x} ${yy.toFixed(2)} ${w} ${h} re f\n`; };
  const tableHead = () => {
    rect(M, y - 6, W - 2 * M, 20, "0.12 0.37 0.92");
    let x = M + 6; HEAD.forEach((h, i) => { text(x, y, h, 9, true, "1 1 1"); x += cols[i]; });
    y -= 22;
  };
  const newPage = (first: boolean) => {
    if (ops) pages.push(ops);
    ops = ""; y = H - M;
    text(M, y, "SMS Masivo", 15, true, "0.12 0.37 0.92");
    text(W - M - 150, y + 2, "Historial de campaña", 10, false, "0.40 0.45 0.55");
    y -= 12; ops += `0.86 0.89 0.94 RG 0.8 w ${M} ${y} m ${W - M} ${y} l S\n`; y -= 20;
    if (first) {
      for (const [k, v] of meta(rep)) { text(M, y, k, 9, true); text(M + 90, y, fit(v, W - 2 * M - 90, 9), 9); y -= 14; }
      y -= 10;
    }
    tableHead();
  };
  newPage(true);
  rep.rows.forEach((r, n) => {
    if (y < M + 30) newPage(false);
    if (n % 2) rect(M, y - 5, W - 2 * M, 17, "0.96 0.97 0.99");
    let x = M + 6; cells(r).forEach((v, i) => { text(x, y, fit(v, cols[i] - 10, 8.5), 8.5); x += cols[i]; });
    y -= 17;
  });
  if (!rep.rows.length) text(M + 6, y, "Sin destinatarios para este filtro.", 9);
  pages.push(ops);

  // Objetos: 1 catálogo, 2 páginas, 3-4 fuentes, luego (página, contenido) por cada hoja.
  const objs: string[] = [];
  const kids = pages.map((_, i) => `${5 + i * 2} 0 R`).join(" ");
  objs[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objs[2] = `<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`;
  objs[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
  objs[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";
  pages.forEach((p, i) => {
    const footer = `BT 0.55 0.60 0.68 rg /F1 8 Tf ${M} 24 Td (${enc(`smsmasivo.cd.com.py · ${date(new Date().toISOString())}`)}) Tj ET\nBT 0.55 0.60 0.68 rg /F1 8 Tf ${W - M - 60} 24 Td (${enc(`Página ${i + 1} de ${pages.length}`)}) Tj ET\n`;
    const stream = p + footer;
    objs[5 + i * 2] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6 + i * 2} 0 R >>`;
    objs[6 + i * 2] = `<< /Length ${stream.length} >>\nstream\n${stream}endstream`;
  });
  let out = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets: number[] = [];
  for (let i = 1; i < objs.length; i++) { offsets[i] = out.length; out += `${i} 0 obj\n${objs[i]}\nendobj\n`; }
  const xref = out.length;
  out += `xref\n0 ${objs.length}\n0000000000 65535 f \n` + offsets.slice(1).map(o => `${String(o).padStart(10, "0")} 00000 n \n`).join("");
  out += `trailer\n<< /Size ${objs.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  const bytes = new Uint8Array(out.length);
  for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 0xff;
  return bytes;
}

export function exportPdf(rep: Report) {
  const bytes = buildPdf(rep);
  download(new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" }), `${fileBase(rep.campaign)}.pdf`);
}

/* ------------------------------------------------------------- Imprimir --- */
const esc = (s: string) => s.replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]!));

export function printReport(rep: Report) {
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(fileBase(rep.campaign))}</title><style>
  @page { size: A4; margin: 14mm; }
  body { font: 11px/1.45 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #101a33; margin: 0; }
  header { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid #1f5eea; padding-bottom: 6px; margin-bottom: 12px; }
  header b { font-size: 18px; color: #1f5eea; } header span { color: #667085; }
  dl { display: grid; grid-template-columns: 110px 1fr; gap: 3px 10px; margin: 0 0 14px; } dt { font-weight: 700; } dd { margin: 0; }
  table { width: 100%; border-collapse: collapse; } th { background: #1f5eea; color: #fff; text-align: left; padding: 6px 7px; font-size: 10.5px; }
  td { padding: 5px 7px; border-bottom: 1px solid #e3e8f2; vertical-align: top; } tr:nth-child(even) td { background: #f5f7fc; }
  thead { display: table-header-group; } tr { break-inside: avoid; }
  footer { margin-top: 12px; color: #667085; font-size: 10px; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  </style></head><body>
  <header><b>SMS Masivo</b><span>Historial de campaña</span></header>
  <dl>${meta(rep).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
  <table><thead><tr>${HEAD.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>
  ${rep.rows.map(r => `<tr>${cells(r).map(v => `<td>${esc(v)}</td>`).join("")}</tr>`).join("") || `<tr><td colspan="5">Sin destinatarios para este filtro.</td></tr>`}
  </tbody></table><footer>smsmasivo.cd.com.py · ${esc(date(new Date().toISOString()))}</footer></body></html>`;
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
  frame.srcdoc = html;
  frame.onload = () => {
    const w = frame.contentWindow;
    if (!w) return;
    w.focus(); w.print();
    setTimeout(() => frame.remove(), 60_000);
  };
  document.body.appendChild(frame);
}
