"use client";

import { useId, useState } from "react";
import Link from "@/components/plain-link";
import { Calculator } from "lucide-react";
import { prepareSms, SMS_MAX } from "@/lib/sms-text";

const gs = (n: number) => `Gs. ${Math.round(n).toLocaleString("es-PY").replace(/,/g, ".")}`;

/** Simulador: escribís el mensaje y la cantidad de contactos y ves caracteres, créditos y costo total. */
export default function CostSim({ price }: { price: number }) {
  const id = useId();
  const [text, setText] = useState("");
  const [qty, setQty] = useState(1000);
  const p = prepareSms(text);
  const bad = p.unsupported.length > 0 || p.length > SMS_MAX;
  const n = Math.max(0, Math.min(1_000_000, Math.floor(qty) || 0));
  const total = !text.trim() || bad ? 0 : n * price;
  const note = p.unsupported.length ? `El carácter ${p.unsupported[0]} no se puede enviar por SMS.`
    : p.length > SMS_MAX ? `Te pasás por ${p.length - SMS_MAX} caracteres: el máximo es ${SMS_MAX}.`
    : p.changed ? "Las tildes se envían sin acento para mantener 1 SMS (la ñ se conserva)."
    : `1 SMS = 1 crédito = ${gs(price)}. Sin mensualidad.`;
  return <div className="hs-card sim">
    <div className="sim-head"><span className="sim-ico"><Calculator size={24} aria-hidden /></span><div><h2>Simulador de SMS</h2><p>Calculá el costo de tu campaña en segundos.</p></div></div>
    <label className="sr-only" htmlFor={`${id}-t`}>Mensaje</label>
    <textarea id={`${id}-t`} value={text} onChange={e => setText(e.target.value)} maxLength={320} placeholder="Escribí tu mensaje aquí…" spellCheck={false} />
    <div className="sim-row">
      <label htmlFor={`${id}-q`}>Contactos</label>
      <input id={`${id}-q`} type="number" min={0} step={100} inputMode="numeric" value={qty} onChange={e => setQty(Number(e.target.value))} />
    </div>
    <div className={`sim-out${bad ? " over" : ""}`} aria-live="polite">
      <span>Caracteres: <b>{p.length}</b>/{SMS_MAX}</span>
      <span>Costo: <b>{bad ? "—" : gs(total)}</b></span>
    </div>
    <p className={`sim-note${bad ? " over" : ""}`}>{note}</p>
    <Link className="btn btn-primary sim-btn" href="/register"><Calculator size={17} aria-hidden />Crear cuenta y enviar</Link>
  </div>;
}
