import Link from "@/components/plain-link";
import { ArrowRight, Menu } from "lucide-react";
import Logo from "@/components/logo";
import { WHATSAPP_URL } from "@/lib/site";
import ThemeToggle from "@/components/theme-toggle";
import { WhatsAppIcon } from "@/components/icons";
import type { SeoPage } from "@/lib/seo-pages";

export function Brand() { return <Logo />; }

const NAV = [["/", "Inicio"], ["/#servicios", "Servicios"], ["/precios-sms", "Precios"], ["/docs", "API"], ["/#preguntas", "Preguntas"], [WHATSAPP_URL, "Contacto"]] as const;
const isExt = (href: string) => href.startsWith("http");

export function SiteNav({ active = "" }: { active?: string }) {
  const link = ([href, label]: readonly [string, string]) => isExt(href)
    ? <a key={href} href={href} target="_blank" rel="noopener noreferrer">{label}</a>
    : <Link key={href} href={href} className={label.toLowerCase() === active ? "on" : ""} aria-current={label.toLowerCase() === active ? "page" : undefined}>{label}</Link>;
  return <header className="site-nav"><div className="container nav-in">
    <Logo tagline />
    <nav className="nav-links" aria-label="Principal">{NAV.map(link)}</nav>
    <div className="nav-actions">
      <ThemeToggle />
      <Link className="nav-login" href="/login">Ingresar</Link>
      <Link className="btn btn-primary btn-sm nav-cta" href="/register">Empezar ahora <ArrowRight size={16} aria-hidden /></Link>
      <details className="nav-menu"><summary aria-label="Abrir menú"><Menu size={18} aria-hidden/></summary>
        <nav>{NAV.map(link)}<Link href="/login">Ingresar</Link><Link href="/register">Empezar ahora</Link></nav></details>
    </div>
  </div></header>;
}

export function SiteFooter({ pages }: { pages: SeoPage[] }) {
  return <footer className="site-footer"><div className="container">
    <div className="foot-grid">
      <div><Logo tagline /><p>Plataforma de SMS masivos para Paraguay: campañas, API y reportes para empresas.</p></div>
      <div><h3>Servicios</h3>{pages.slice(0, 7).map(p => <Link key={p.slug} href={`/${p.slug}`}>{p.label}</Link>)}</div>
      <div><h3>Más</h3>{pages.slice(7).map(p => <Link key={p.slug} href={`/${p.slug}`}>{p.label}</Link>)}<Link href="/docs">Documentación API</Link></div>
      <div><h3>Cuenta y legal</h3><Link href="/login">Ingresar</Link><Link href="/register">Crear cuenta</Link><Link href="/privacidad">Privacidad</Link><Link href="/terminos">Términos</Link></div>
    </div>
    <div className="foot-bottom"><small>© 2026 SMS Masivo · CNID. SMS masivo en todo Paraguay.</small><div className="foot-social"><span>Seguinos en</span><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp de SMS Masivo" className="soc-wa"><WhatsAppIcon size={18} /></a></div></div>
  </div></footer>;
}
