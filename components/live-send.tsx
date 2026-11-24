"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Gauge, Radio, Send } from "lucide-react";

/** Operadoras con sus colores de acento (solo el nombre, sin logotipos). */
const OPS = [
  { name: "Tigo", color: "#1f5eea", base: 4120, share: 0.38 },
  { name: "Personal", color: "#00a6d6", base: 2980, share: 0.27 },
  { name: "Claro", color: "#e5304a", base: 2210, share: 0.22 },
  { name: "Vox", color: "#f08a1c", base: 1190, share: 0.13 },
] as const;
const GOAL = 15000;
// Geometría del escenario (coincide con el viewBox 1000×420 del SVG).
const FROM = { x: 330, y: 210 };
const NODE_Y = [60, 160, 260, 360];
const NODE_X = 712;
const pathFor = (y: number) => `M${FROM.x} ${FROM.y} C ${FROM.x + 170} ${FROM.y}, ${NODE_X - 190} ${y}, ${NODE_X} ${y}`;
const fmt = (n: number) => Math.round(n).toLocaleString("es-PY");

/**
 * Simulación de una campaña saliendo hacia las cuatro operadoras: sobres que viajan por
 * cada ruta (SVG animateMotion, sin JavaScript) y contadores que suben mientras la sección
 * está a la vista. Con movimiento reducido queda quieta y legible.
 */
export default function LiveSend() {
  const [counts, setCounts] = useState<number[]>(OPS.map((o) => o.base));
  const [hits, setHits] = useState<number[]>([0, 0, 0, 0]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const tick = () => {
      const burst = 18 + Math.floor(Math.random() * 30);
      setCounts((prev) => prev.reduce((a, b) => a + b, 0) >= GOAL
        ? OPS.map((o) => o.base) // la campaña vuelve a empezar
        : prev.map((c, i) => c + Math.round(burst * OPS[i].share + Math.random() * 3)));
      setHits((h) => h.map((v, i) => (Math.random() < 0.6 + OPS[i].share ? v + 1 : v)));
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !timer) timer = setInterval(tick, 260);
      else if (!e.isIntersecting && timer) { clearInterval(timer); timer = undefined; }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => { io.disconnect(); if (timer) clearInterval(timer); };
  }, []);

  const total = counts.reduce((a, b) => a + b, 0);
  const pct = Math.min(100, (total / GOAL) * 100);

  return <div className="ls" ref={ref}>
    <div className="ls-stage">
      <svg className="ls-svg" viewBox="0 0 1000 420" aria-hidden="true">
        <defs>
          <linearGradient id="lsg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#1f5eea" stopOpacity=".15" /><stop offset="1" stopColor="#7b4dff" stopOpacity=".55" /></linearGradient>
          <g id="lsenv">
            <rect x="-15" y="-10" width="30" height="20" rx="5" fill="#fff" stroke="currentColor" strokeWidth="2" />
            <path d="M-11 -5 0 2 11 -5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </defs>
        {NODE_Y.map((y, i) => <g key={i} style={{ color: OPS[i].color }}>
          <path d={pathFor(y)} fill="none" stroke="url(#lsg)" strokeWidth="2.5" />
          <path className="ls-dash" d={pathFor(y)} fill="none" stroke={OPS[i].color} strokeWidth="2.5" strokeDasharray="2 14" strokeLinecap="round" opacity=".55" />
          {[0, 1, 2].map((k) => {
            const dur = 2.1 + i * 0.12;
            const begin = `${(k * dur) / 3 + i * 0.27}s`;
            return <g key={k} className="ls-token" opacity="0">
              <use href="#lsenv" />
              <animateMotion dur={`${dur}s`} begin={begin} repeatCount="indefinite" path={pathFor(y)} rotate="0" />
              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.12;.85;1" dur={`${dur}s`} begin={begin} repeatCount="indefinite" />
            </g>;
          })}
        </g>)}
      </svg>

      <div className="ls-hub">
        <div className="ls-hub-head"><span className="ls-live"><i />EN VIVO</span><small>Campaña · Promo fin de mes</small></div>
        <div className="ls-msg">Hola María, este finde 20% OFF en toda la tienda. Escribinos: wa.me/5959…</div>
        <div className="ls-progress" role="progressbar" aria-label="Avance de la campaña de ejemplo" aria-valuemin={0} aria-valuemax={GOAL} aria-valuenow={Math.round(total)}>
          <span style={{ width: `${pct}%` }} />
        </div>
        <div className="ls-meta"><b>{fmt(total)}</b><span>de {fmt(GOAL)} enviados</span></div>
        <div className="ls-kpis">
          <span><Send size={14} aria-hidden />{Math.round(pct)}%</span>
          <span><Check size={14} aria-hidden />99,2% aceptados</span>
          <span><Gauge size={14} aria-hidden />~4.800/min</span>
        </div>
      </div>

      <div className="ls-stream" aria-hidden="true"><i /><i /><i /></div>

      <ul className="ls-ops">
        {OPS.map((o, i) => <li key={o.name} className="ls-op" style={{ ["--op" as string]: o.color, ["--y" as string]: `${(NODE_Y[i] / 420) * 100}%` }}>
          <span className="ls-ring" key={hits[i]} aria-hidden="true" />
          <span className="ls-op-dot" aria-hidden="true"><Radio size={16} /></span>
          <div><b>{o.name}</b><small><span className="ls-num">{fmt(counts[i])}</span> entregados</small></div>
          <em key={`e${hits[i]}`} aria-hidden="true">+{Math.max(1, Math.round(26 * o.share))}</em>
        </li>)}
      </ul>
    </div>
    <p className="ls-note">Simulación ilustrativa de una campaña. Tus cifras reales las ves en tu panel.</p>
  </div>;
}
