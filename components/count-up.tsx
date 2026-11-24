"use client";

import { useEffect, useRef, useState } from "react";

const fmt = (n: number, decimals: number) =>
  n.toLocaleString("es-PY", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

const reduced = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Number that counts up when it scrolls into view and, with `tick`, keeps rising slowly
 * (as if messages kept going out). The server renders the final value, so it reads right
 * without JavaScript or with reduced motion.
 */
export default function CountUp({ to, decimals = 0, suffix = "", tick = 0, ms = 1400 }: {
  to: number; decimals?: number; suffix?: string; tick?: number; ms?: number;
}) {
  const [val, setVal] = useState(to);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    let raf = 0, timer: ReturnType<typeof setInterval> | undefined, started = false;
    const from = to * 0.55;
    const run = () => {
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / ms);
        setVal(from + (to - from) * (1 - Math.pow(1 - p, 3)));
        if (p < 1) raf = requestAnimationFrame(step);
        else if (tick > 0) timer = setInterval(() => setVal((v) => v + Math.ceil(Math.random() * tick)), 900);
      };
      raf = requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) { started = true; run(); }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); if (timer) clearInterval(timer); };
  }, [to, ms, tick]);

  return <span ref={ref}>{fmt(decimals ? val : Math.round(val), decimals)}{suffix}</span>;
}
