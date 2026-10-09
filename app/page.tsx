import type { Metadata } from "next";
import Link from "@/components/plain-link";
import { BarChart3, CalendarClock, Check, Code2, MessageCircle, Send, Users } from "lucide-react";
import Composer from "@/components/composer";
import LandingSeo from "@/components/landing-seo";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { getPrice } from "@/lib/price";
import { seoPages } from "@/lib/seo-pages";
import { SITE_URL } from "@/lib/site";

const TITLE = "SMS masivo Paraguay | Envío de SMS a Tigo, Claro, Personal y Vox";
const DESC = "Plataforma de SMS masivos en Paraguay: campañas, SMS marketing, cobranzas y API para empresas. Enviá a Tigo, Claro, Personal y Vox. Sin mensualidad.";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: TITLE }, description: DESC, alternates: { canonical: SITE_URL },
  openGraph: { type: "website", url: SITE_URL, title: TITLE, description: DESC, siteName: "NexoSMS", locale: "es_PY", images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "NexoSMS - SMS masivo en Paraguay" }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: [`${SITE_URL}/og-image.png`] },
};

const CAPS = [
  [Send, "Campañas masivas", "Enviá a miles de contactos a la vez, ahora o a la hora que elijas. Pausá, editá o cancelá mientras corre."],
  [Users, "Contactos sin vueltas", "Pegá números o importá un Excel o CSV. Se validan, se limpian y se eliminan los repetidos."],
  [CalendarClock, "Mensajes programados", "Dejá lista la campaña del lunes el viernes. Se envía sola en la fecha y hora que definas."],
  [BarChart3, "Reportes claros", "Qué se envió, qué falló y cuánto gastaste, por fecha y por campaña. Exportable a CSV."],
  [MessageCircle, "Un toque a WhatsApp", "Sumá un enlace directo para que el cliente te escriba apenas lea el SMS."],
  [Code2, "API para tu sistema", "Conectá tu CRM, tienda o ERP. Probá cada llamada en línea con tu API Key."],
] as const;

export default async function Home() {
  const price = await getPrice();
  const pages = seoPages(price);
  const gs = price.toLocaleString("es-PY").replace(/,/g, ".");
  return <div className="site">
    <SiteNav />
    <main>
      <div className="container hero">
        <div>
          <h1>SMS masivo en Paraguay, claro y sin sorpresas</h1>
          <p className="lead">Enviá campañas a clientes de Tigo, Claro, Personal y Vox desde el navegador o con una API. Cada mensaje de hasta 160 caracteres cuesta 1 crédito, y lo ves antes de enviar.</p>
          <div className="hero-cta"><Link className="btn btn-primary btn-lg" href="/register">Crear cuenta gratis</Link><Link className="btn btn-ghost btn-lg" href="/docs">Ver la API</Link></div>
          <p className="hero-note">Prepago, sin mensualidad ni contrato.</p>
        </div>
        <Composer price={price} />
      </div>

      <div className="container"><div className="reach"><p>Llegamos a clientes de</p><ul>
        <li><Link href="/sms-tigo">Tigo</Link></li><li><Link href="/sms-claro">Claro</Link></li><li><Link href="/sms-personal">Personal</Link></li><li><Link href="/sms-vox">Vox</Link></li>
      </ul></div></div>

      <section className="section container" id="como-funciona">
        <div className="section-head"><h2>De tu lista al celular en tres pasos</h2><p>Sin instalar nada y sin hablar con nadie.</p></div>
        <ol className="steps">
          <li><h3>Cargá tus contactos</h3><p>Pegá los números o subí un archivo. Detectamos los inválidos y los repetidos por vos.</p></li>
          <li><h3>Escribí el mensaje</h3><p>Usá el nombre de cada cliente y otros datos. El contador te avisa antes de pasarte de 160.</p></li>
          <li><h3>Enviá o programá</h3><p>Mirá cuántos créditos usa la campaña y lanzala. Seguís el resultado en tiempo real.</p></li>
        </ol>
      </section>

      <section className="section container" id="funciones">
        <div className="section-head"><h2>Lo necesario para comunicarte con tus clientes</h2><p>Pensado para negocios de Paraguay: simple de usar y preciso en el costo.</p></div>
        <div className="caps">{CAPS.map(([Icon, title, text]) => <div key={title}><h3><Icon size={20} aria-hidden/>{title}</h3><p>{text}</p></div>)}</div>
      </section>

      <section className="section container" id="api">
        <div className="split">
          <div className="section-head" style={{ marginBottom: 0 }}>
            <h2>Una llamada y el SMS sale</h2>
            <p>Enviá desde tu aplicación con una API REST. Consultá el saldo, el historial y el estado de tus campañas con la misma clave.</p>
            <div className="hero-cta"><Link className="btn btn-primary" href="/api-sms">Conocer la API</Link><Link className="btn btn-ghost" href="/docs">Probarla en línea</Link></div>
          </div>
          <div>
            <div className="code"><header><span>POST /api/messages</span><span>cURL</span></header><pre>{`curl -X POST https://nexosms.cnid.com.py/api/messages \\
  -H "X-API-Key: sms_TU_CLAVE" \\
  -H "Content-Type: application/json" \\
  -d '{"phone":"0981123456",
       "message":"Tu código es 482915"}'`}</pre></div>
            <div className="code"><header><span>Respuesta</span><span>201</span></header><pre>{`{ "message": { "status": "aceptado",
               "segments": 1 } }`}</pre></div>
          </div>
        </div>
      </section>

      <section className="section price-band" id="precios" style={{ marginTop: 0 }}>
        <div className="container price-grid">
          <div className="price-num">Gs. {gs}<small>por SMS, hasta 160 caracteres</small></div>
          <ul className="checks">
            <li><Check size={18} aria-hidden/>Comprás los créditos que necesitás, desde 1.000 SMS.</li>
            <li><Check size={18} aria-hidden/>Los créditos no vencen y no hay mensualidad.</li>
            <li><Check size={18} aria-hidden/>Pagás con tarjeta o QR y el saldo se acredita solo.</li>
            <li><Check size={18} aria-hidden/>Si un envío es rechazado, el crédito vuelve a tu saldo.</li>
          </ul>
          <Link className="btn btn-primary btn-lg" href="/precios-sms">Ver precios</Link>
        </div>
      </section>

      <LandingSeo pages={pages} price={price} />

      <div className="container"><div className="cta-band"><div><h2>Hablemos con tus clientes</h2><p>Creá tu cuenta y mandá tu primera campaña hoy.</p></div><Link className="btn btn-primary btn-lg" href="/register">Crear mi cuenta</Link></div></div>
    </main>
    <SiteFooter pages={pages} />
  </div>;
}
