import Link from "@/components/plain-link";
import { Menu, MessageSquareText } from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import type { SeoPage } from "@/lib/seo-pages";

export function Brand() {
  return <Link className="brand" href="/" aria-label="NexoSMS, inicio"><span className="brand-mark"><MessageSquareText size={19} aria-hidden/></span><span>nexo<span className="brand-dot">sms</span></span></Link>;
}

const NAV = [["/#soluciones", "Soluciones"], ["/precios-sms", "Precios"], ["/api-sms", "API"], ["/docs", "Documentación"]] as const;

export function SiteNav() {
  return <header className="site-nav"><div className="container nav-in">
    <Brand />
    <nav className="nav-links" aria-label="Principal">{NAV.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}</nav>
    <div className="nav-actions">
      <ThemeToggle />
      <Link className="nav-login" href="/login">Ingresar</Link>
      <Link className="btn btn-primary btn-sm" href="/register">Crear cuenta</Link>
      <details className="nav-menu"><summary aria-label="Abrir menú"><Menu size={18} aria-hidden/></summary>
        <nav>{NAV.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}<Link href="/login">Ingresar</Link><Link href="/register">Crear cuenta</Link></nav></details>
    </div>
  </div></header>;
}

export function SiteFooter({ pages }: { pages: SeoPage[] }) {
  return <footer className="site-footer"><div className="container">
    <div className="foot-grid">
      <div><Brand /><p>Plataforma de SMS masivos para Paraguay: campañas, API y reportes para empresas.</p></div>
      <div><h3>Servicios</h3>{pages.slice(0, 7).map(p => <Link key={p.slug} href={`/${p.slug}`}>{p.label}</Link>)}</div>
      <div><h3>Más</h3>{pages.slice(7).map(p => <Link key={p.slug} href={`/${p.slug}`}>{p.label}</Link>)}<Link href="/docs">Documentación API</Link></div>
      <div><h3>Cuenta y legal</h3><Link href="/login">Ingresar</Link><Link href="/register">Crear cuenta</Link><Link href="/privacidad">Privacidad</Link><Link href="/terminos">Términos</Link></div>
    </div>
    <small>© 2026 NexoSMS. SMS masivo en todo Paraguay.</small>
  </div></footer>;
}
