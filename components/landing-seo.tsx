import Link from "@/components/plain-link";
import { Faq, faqLd, Ld, orgLd } from "@/components/seo-page";
import { blurb, CITIES, DEPARTMENTS, type SeoPage } from "@/lib/seo-pages";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const landingFaq = (price: number) => [
  { q: "¿Cómo enviar SMS masivos en Paraguay?", a: "Creás tu cuenta en NexoSMS, cargás créditos, importás tu lista de contactos (Excel, CSV o pegando números), escribís el mensaje y lo enviás o lo programás. También podés enviar desde tu sistema con la API." },
  { q: "¿Cuánto cuesta un SMS en Paraguay?", a: `En NexoSMS cada SMS cuesta Gs. ${price.toLocaleString("es-PY").replace(",", ".")}, con hasta 160 caracteres. Es prepago, sin mensualidad, y los créditos no vencen.` },
  { q: "¿Puedo enviar SMS a Tigo, Claro, Personal y Vox?", a: "Sí. Podés enviar a números de todas las operadoras desde la misma lista y la misma campaña, al mismo precio." },
  { q: "¿Tienen API para enviar SMS desde mi sistema?", a: "Sí. La API REST permite enviar SMS, consultar saldo, ver el historial y gestionar campañas. En la documentación podés probarla en línea con tu API Key." },
  { q: "¿Puedo programar los SMS y personalizar cada mensaje?", a: "Sí. Podés programar la fecha y hora de cada campaña y personalizar el texto con el nombre del cliente y otros datos de tu lista." },
];

export function landingJsonLd(price: number) {
  return { "@context": "https://schema.org", "@graph": [
    orgLd,
    { "@type": "WebSite", "@id": `${SITE_URL}/#site`, url: SITE_URL, name: SITE_NAME, inLanguage: "es-PY", publisher: { "@id": `${SITE_URL}/#org` } },
    { "@type": "Service", name: "Envío de SMS masivos en Paraguay", serviceType: "SMS masivo", provider: { "@id": `${SITE_URL}/#org` }, areaServed: { "@type": "Country", name: "Paraguay" }, url: SITE_URL,
      offers: { "@type": "Offer", priceCurrency: "PYG", price: String(price), description: "Precio por SMS (prepago, sin mensualidad)" } },
    faqLd(landingFaq(price)),
  ] };
}

export default function LandingSeo({ pages, price }: { pages: SeoPage[]; price: number }) {
  return <>
    <Ld data={landingJsonLd(price)} />
    <section className="section container" id="soluciones">
      <div className="section-head"><h2>Servicio de SMS masivo para cada necesidad</h2><p>Marketing, cobranzas, notificaciones, verificación por código y API: elegí cómo usar el SMS en tu empresa.</p></div>
      <ul className="index">{pages.map(p => <li key={p.slug}><Link href={`/${p.slug}`}><b>{p.label}</b><span>{blurb(p.description)}</span></Link></li>)}</ul>
    </section>
    <section className="section container" id="cobertura">
      <div className="section-head"><h2>SMS a todo Paraguay y a todas las operadoras</h2></div>
      <p className="lead">Enviá mensajes a clientes de <Link href="/sms-tigo">Tigo</Link>, <Link href="/sms-claro">Claro</Link>, <Link href="/sms-personal">Personal</Link> y <Link href="/sms-vox">Vox</Link> en todo el país: {CITIES}. Llegamos a los departamentos {DEPARTMENTS}, y al resto del territorio nacional.</p>
    </section>
    <section className="section container" id="preguntas">
      <div className="section-head"><h2>Preguntas frecuentes sobre el envío de SMS</h2></div>
      <Faq items={landingFaq(price)} />
    </section>
  </>;
}
