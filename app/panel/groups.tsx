"use client";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { type Ask, type Group, request } from "./shared";

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
