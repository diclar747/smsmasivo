"use client";
import { useId, useState } from "react";
import Link from "@/components/plain-link";
import { MessageSquareText } from "lucide-react";
import { prepareSms, SMS_MAX } from "@/lib/sms-text";

/** Compositor de ejemplo: muestra en vivo cómo se cuenta y se envía un SMS (160 caracteres = 1 crédito). */
export default function Composer({ price }: { price: number }) {
  const id = useId();
  const [text, setText] = useState("Hola María, tu pedido #4821 está listo. ¡Pasá a retirarlo hoy!");
  const p = prepareSms(text);
  const extra = p.length - SMS_MAX;
  const bad = p.unsupported.length > 0 || extra > 0;
  const pct = Math.min(100, (p.length / SMS_MAX) * 100);
  const gs = `Gs. ${price.toLocaleString("es-PY").replace(/,/g, ".")}`;
  const status = p.unsupported.length ? `El carácter ${p.unsupported[0]} no se puede enviar por SMS. Quitalo.`
    : extra > 0 ? `Te pasás por ${extra} ${extra === 1 ? "carácter" : "caracteres"}. NexoSMS no envía mensajes de más de ${SMS_MAX}: acortalo.`
    : p.length === 0 ? "Escribí un mensaje para ver cuánto cuesta."
    : `Cabe en un solo SMS. Se descuenta 1 crédito (${gs}).`;
  return <div className="composer">
    <div className="composer-head"><span className="brand-mark"><MessageSquareText size={18} aria-hidden/></span><div><b>Probá tu mensaje</b><small>Así lo cuenta NexoSMS antes de enviarlo</small></div></div>
    <div className="composer-body">
      <label htmlFor={id}>Mensaje</label>
      <textarea id={id} value={text} onChange={e => setText(e.target.value)} maxLength={320} spellCheck={false} aria-describedby={`${id}-s`} />
      <div className="gauge-row">
        <div className={`count${bad ? " over" : ""}`} aria-hidden>{p.length}<small>/{SMS_MAX}</small></div>
        <div className={`cost${bad ? " over" : ""}`}>{bad ? "No se enviaría" : p.length ? "1 crédito" : ""}</div>
      </div>
      <div className="gauge" aria-hidden><i className={bad ? "over" : ""} style={{ width: `${pct}%` }} /></div>
      <p id={`${id}-s`} className={`composer-status${bad ? " over" : ""}`} role="status" aria-live="polite">{status}</p>
    </div>
    <div className="composer-preview"><span>Así llega al celular</span><div className="bubble">{p.text || "…"}</div>{p.changed && !bad && <div><span className="chip">Se envía sin tildes para mantener 1 SMS (la ñ se conserva)</span></div>}</div>
    <div className="composer-foot"><small>Sin mensualidad. Los créditos no vencen.</small><Link className="btn btn-primary btn-sm" href="/register">Crear cuenta y enviar</Link></div>
  </div>;
}
