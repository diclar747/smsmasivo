"use client";
import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { type Ask, type Contact, type Group, request } from "./shared";

const errMsg = (e: unknown) => e instanceof Error ? e.message : "Ocurrió un error";

/** Pide el nombre y crea un grupo. Devuelve el grupo creado o null si se canceló. */
export async function createGroupDialog(ask: Ask, flash: (s: string) => void): Promise<Group | null> {
  const name = await ask({ title: "Nuevo grupo", message: "Agrupá contactos para enviarles campañas juntos, por ejemplo Clientes interesados.", input: { label: "Nombre del grupo" }, confirmLabel: "Crear grupo" });
  if (typeof name !== "string" || !name.trim()) return null;
  try { const d = await request("groups", "POST", { name }); flash(`Grupo ${d.group.name} creado`); return d.group as Group; } catch (e) { flash(errMsg(e)); return null; }
}

/** Selector de grupos: filtra la lista de contactos y permite crear, renombrar y eliminar grupos. */
export function GroupsBar({ groups, active, onActive, total, ask, flash, onChanged }: {
  groups: Group[]; active: string | null; onActive: (id: string | null) => void; total: number; ask: Ask; flash: (s: string) => void; onChanged: () => void;
}) {
  const current = groups.find(g => g.id === active) || null;
  async function create() { const g = await createGroupDialog(ask, flash); if (g) { onChanged(); onActive(g.id); } }
  async function rename(g: Group) {
    const name = await ask({ title: "Renombrar grupo", input: { label: "Nombre del grupo", initial: g.name }, confirmLabel: "Guardar" });
    if (typeof name !== "string" || !name.trim() || name.trim() === g.name) return;
    try { await request(`groups/${g.id}`, "PUT", { name }); flash("Grupo renombrado"); onChanged(); } catch (e) { flash(errMsg(e)); }
  }
  async function remove(g: Group) {
    if (!await ask({ title: "Eliminar grupo", message: `Se elimina el grupo ${g.name}. Los contactos no se borran: siguen en tu base.`, confirmLabel: "Eliminar grupo", danger: true })) return;
    try { await request(`groups/${g.id}`, "DELETE"); flash("Grupo eliminado"); onActive(null); onChanged(); } catch (e) { flash(errMsg(e)); }
  }
  return <div className="grp-bar" role="group" aria-label="Grupos de contactos">
    <button className={`grp-chip${active === null ? " on" : ""}`} onClick={() => onActive(null)}>Todos <b>{total}</b></button>
    {groups.map(g => <button key={g.id} className={`grp-chip${active === g.id ? " on" : ""}`} onClick={() => onActive(g.id)}>{g.name} <b>{g.count}</b></button>)}
    <button className="grp-new" onClick={create}><Plus size={14} /> Nuevo grupo</button>
    {current && <span className="grp-actions"><button onClick={() => rename(current)}><Pencil size={14} /> Renombrar</button><button className="danger" onClick={() => remove(current)}><Trash2 size={14} /> Eliminar grupo</button></span>}
  </div>;
}

/** Edición de un contacto: nombre, número y grupos (con opción de crear un grupo nuevo desde acá). */
export function EditContactModal({ contact, groups, ask, flash, onClose, onSaved }: {
  contact: Contact; groups: Group[]; ask: Ask; flash: (s: string) => void; onClose: () => void; onSaved: () => void;
}) {
  const [name, setName] = useState(contact.name);
  const [phone, setPhone] = useState(contact.phone.replace(/^595/, "0"));
  const [sel, setSel] = useState<Set<string>>(new Set(contact.group_ids || []));
  const [created, setCreated] = useState<Group[]>([]);
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const all = [...groups, ...created.filter(c => !groups.some(g => g.id === c.id))];
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  const toggle = (id: string) => setSel(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  async function newGroup() { const g = await createGroupDialog(ask, flash); if (g) { setCreated(c => [...c, g]); setSel(prev => new Set(prev).add(g.id)); } }
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    try { await request(`contacts/${contact.id}`, "PUT", { name, phone, groupIds: [...sel] }); flash("Contacto actualizado"); onSaved(); onClose(); }
    catch (err) { setError(errMsg(err)); } finally { setBusy(false); }
  }
  return <div className="modal-backdrop" onClick={onClose}>
    <form className="modal edit-contact" role="dialog" aria-modal="true" aria-label="Editar contacto" onClick={e => e.stopPropagation()} onSubmit={save}>
      <h3>Editar contacto</h3>
      <label>Nombre<input autoFocus value={name} onChange={e => setName(e.target.value)} maxLength={100} placeholder="Nombre del contacto" /></label>
      <label>Número de celular<input value={phone} onChange={e => setPhone(e.target.value)} placeholder="0981 234 567" inputMode="tel" /></label>
      <div className="edit-groups"><div className="edit-groups-head"><span>Grupos</span><button type="button" onClick={newGroup}><Plus size={13} /> Nuevo grupo</button></div>
        {all.length ? <ul>{all.map(g => <li key={g.id}><label><input type="checkbox" checked={sel.has(g.id)} onChange={() => toggle(g.id)} /><span>{g.name}</span></label></li>)}</ul>
          : <p className="edit-empty">Todavía no tenés grupos. Creá uno con Nuevo grupo.</p>}
      </div>
      {error && <div className="form-error" role="alert">{error}</div>}
      <div className="modal-actions"><button type="button" className="secondary-btn" onClick={onClose}>Cancelar</button><button className="action-btn" disabled={busy || !phone.trim()}>{busy ? "Guardando..." : "Guardar cambios"}</button></div>
    </form>
  </div>;
}
