import type { Metadata } from "next";
import Link from "@/components/plain-link";
import { ArrowRight, BarChart3, BellRing, Check, Code2, Headphones, Lock, Megaphone, Play, Rocket, ShieldCheck, Wallet, Zap } from "lucide-react";
import ApiTabs from "@/components/api-tabs";
import CostSim from "@/components/cost-sim";
import { HeroScene, LaptopMock, OperatorStrip } from "@/components/hero-art";
import LiveSend from "@/components/live-send";
import LandingSeo from "@/components/landing-seo";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { getPrice } from "@/lib/price";
import { seoPages } from "@/lib/seo-pages";
import { KEYWORDS, SITE_NAME, SITE_URL } from "@/lib/site";

const TITLE = "SMS Masivo | SMS masivos en Paraguay a Tigo, Claro, Personal y Vox";
const DESC = "SMS Masivo: plataforma de SMS masivos en Paraguay. Campañas de SMS, SMS marketing, cobranzas, recordatorios y API para empresas. Enviá a Tigo, Claro, Personal y Vox. Sin mensualidad.";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: TITLE }, description: DESC, keywords: KEYWORDS, alternates: { canonical: SITE_URL },
  openGraph: { type: "website", url: SITE_URL, title: TITLE, description: DESC, siteName: SITE_NAME, locale: "es_PY", images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "SMS Masivo - envío de SMS masivos en Paraguay" }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: [`${SITE_URL}/og-image.png`] },
};

const SERVICES = [
  [Megaphone, "Campañas masivas", "/sms-masivo-paraguay", "c1"], [ShieldCheck, "OTP y autenticaciones", "/sms-otp", "c2"],
  [BellRing, "Notificaciones instantáneas", "/sms-notificaciones", "c3"], [Wallet, "Cobranzas y recordatorios", "/sms-cobranza", "c4"],
  [BarChart3, "Marketing digital", "/sms-marketing", "c5"], [Code2, "API para desarrolladores", "/api-sms", "c6"],
] as const;
const WHY = [
  [Zap, "Envío inmediato en todo Paraguay"], [BarChart3, "Estadísticas en tiempo real"], [ShieldCheck, "Seguridad y confiabilidad"], [Headphones, "Soporte cercano por WhatsApp"],
] as const;

export default async function Home() {
  const price = await getPrice();
  const pages = seoPages(price);
  const gs = price.toLocaleString("es-PY").replace(/,/g, ".");
  const samples = pages.find(p => p.slug === "api-sms")?.sections.find(s => s.code)?.code ?? [];
  return <div className="site site-landing site-home">
    <SiteNav active="inicio" />
    <main>
      <section className="hx-band">
        <div className="container hx">
          <div className="hx-copy">
            <h1>Tus mensajes.<br /><span className="grad">Todo Paraguay.</span><br />Una sola plataforma.</h1>
            <p className="lead">SMS masivo para empresas, instituciones y desarrolladores. Enviá campañas, notificá, autenticá y mucho más, de forma rápida y segura.</p>
            <ul className="hx-feats">
              <li><Zap size={22} aria-hidden /><span>Envío<br />ultra rápido</span></li>
              <li><ShieldCheck size={22} aria-hidden /><span>Entrega<br />confiable</span></li>
              <li><Headphones size={22} aria-hidden /><span>Soporte<br />personalizado</span></li>
            </ul>
            <div className="hx-cta">
              <div className="hx-price"><b>Gs. {gs}</b><small>por SMS</small><span>Sin mensualidad</span></div>
              <div className="hx-go">
                <Link className="btn btn-go btn-lg" href="/register"><Rocket size={19} aria-hidden />Comenzar ahora<ArrowRight size={18} aria-hidden /></Link>
                <small><Check size={14} aria-hidden />Créditos que no vencen</small>
              </div>
            </div>
          </div>
          <HeroScene />
        </div>
        <OperatorStrip />
      </section>

      <section className="section container ls-section" id="envio-en-vivo" aria-labelledby="ls-title">
        <div className="section-head reveal"><span className="lh-pill"><Zap size={15} aria-hidden />Envío simultáneo</span><h2 id="ls-title">Tu campaña sale a todas las operadoras al mismo tiempo</h2><p>Cargás una sola lista y SMS Masivo reparte los mensajes a Tigo, Personal, Claro y Vox en segundos. Seguís el avance en vivo desde tu panel.</p></div>
        <LiveSend />
      </section>

      <section className="container hs-grid" id="servicios" aria-label="Simulador y servicios">
        <CostSim price={price} />
        <div className="hs-services reveal">
          <h2>Nuestros servicios</h2><p>Todo lo que necesitás en una sola plataforma.</p>
          <div className="svc-grid">{SERVICES.map(([Icon, label, href, c]) => <Link key={href} href={href} className={`svc ${c}`}><Icon size={30} aria-hidden /><span>{label}</span></Link>)}</div>
        </div>
        <div className="hs-card pro reveal">
          <span className="pro-ico"><ShieldCheck size={44} aria-hidden /></span>
          <h2>Plataforma profesional</h2>
          <ul>{["Reportes en tiempo real", "Campañas programadas", "Soporte por WhatsApp", "API REST completa", "Créditos que no vencen"].map(t => <li key={t}><Check size={16} aria-hidden />{t}</li>)}</ul>
        </div>
      </section>

      <section className="container hp-grid" id="api" aria-label="Panel y API">
        <div className="hp-panel reveal">
          <LaptopMock />
          <div><h2>Panel de control simple y potente</h2><p>Gestioná tus campañas, consultá reportes y administrá tus contactos de forma fácil y rápida. Exportá el historial a Excel o PDF.</p>
            <Link className="btn btn-outline-glow" href="/register"><Play size={16} aria-hidden />Probalo gratis</Link></div>
        </div>
        <div className="hp-api reveal">
          <ApiTabs samples={samples} />
          <Link className="api-doc" href="/docs">Ver documentación API <ArrowRight size={15} aria-hidden /></Link>
        </div>
        <ul className="hp-checks reveal">{["Integración fácil", "Documentación completa", "Soporte técnico"].map(t => <li key={t}><Check size={16} aria-hidden />{t}</li>)}</ul>
      </section>

      <section className="container hw-grid" id="como-funciona" aria-label="Por qué elegirnos">
        <div className="hw-intro reveal"><h2>¿Por qué elegir SMS Masivo?</h2><p>Somos el aliado ideal para tu negocio: tecnología de punta, precio claro y el respaldo de CNID, con gente de acá que te atiende por WhatsApp.</p><Link className="btn btn-outline-glow" href="/sms-masivo-paraguay">Conocé más <ArrowRight size={16} aria-hidden /></Link></div>
        <ul className="hw-list reveal">{WHY.map(([Icon, t]) => <li key={t}><Icon size={22} aria-hidden /><span>{t}</span></li>)}</ul>
        <div className="hw-steps reveal"><h2>De tu lista al celular en tres pasos</h2>
          <ol><li><b>Cargá tus contactos</b><span>Pegá números o subí un Excel; detectamos inválidos y repetidos.</span></li><li><b>Escribí el mensaje</b><span>Personalizalo con el nombre y sumá tu link de WhatsApp.</span></li><li><b>Enviá o programá</b><span>Seguís el resultado en tiempo real y exportás el historial.</span></li></ol></div>
        <div className="hw-price reveal" id="precios">
          <span className="hw-price-tag">Precio transparente</span>
          <b>Gs. {gs}</b><small>por SMS</small>
          <ul>{["Sin mensualidad", "Sin costos ocultos", "Créditos que no vencen", "Desde 1.000 SMS"].map(t => <li key={t}><Check size={15} aria-hidden />{t}</li>)}</ul>
          <Link className="btn btn-go" href="/register">Registrarse ahora <ArrowRight size={16} aria-hidden /></Link>
        </div>
      </section>

      <LandingSeo pages={pages} price={price} />

      <div className="container"><div className="cta-band reveal"><div><h2>Hablemos con tus clientes</h2><p>Creá tu cuenta y mandá tu primera campaña hoy.</p></div><Link className="btn btn-primary btn-lg" href="/register">Crear mi cuenta</Link></div></div>
      <p className="container hx-secure"><Lock size={14} aria-hidden /> Plataforma segura: conexión cifrada y contraseñas protegidas.</p>
    </main>
    <SiteFooter pages={pages} />
  </div>;
}
