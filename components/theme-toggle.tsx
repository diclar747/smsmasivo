"use client";
import { Moon, Sun } from "lucide-react";

/** Alterna entre modo claro (por defecto) y oscuro; la elección se guarda en el navegador. */
export default function ThemeToggle() {
  function flip() {
    const el = document.documentElement;
    const next = el.dataset.theme === "dark" ? "light" : "dark";
    el.dataset.theme = next;
    try { localStorage.setItem("nexosms-theme", next); } catch { /* sin almacenamiento */ }
  }
  return <button type="button" className="theme-toggle" onClick={flip} aria-label="Cambiar entre modo claro y modo oscuro" title="Modo claro u oscuro">
    <Sun className="i-sun" size={18} aria-hidden /><Moon className="i-moon" size={18} aria-hidden />
  </button>;
}
