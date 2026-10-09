import type { Metadata } from "next";
import Link from "@/components/plain-link";
import { MessageSquareText } from "lucide-react";
import { prepareSms, SMS_MAX } from "@/lib/sms-text";
import { abs, LAST_MOD, SITE_NAME, SITE_URL, WHATSAPP_PHONE } from "@/lib/site";
import { type SeoPage, seoPages } from "@/lib/seo-pages";

export function pageMetadata(page: SeoPage): Metadata {
  const url = abs(`/${page.slug}`);
  return {
    title: { absolute: page.title }, description: page.description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: page.title, description: page.description, siteName: SITE_NAME, locale: "es_PY", images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "NexoSMS - SMS masivo en Paraguay" }] },
    twitter: { card: "summary_large_image", title: page.title, description: page.description, images: [`${SITE_URL}/og-image.png`] },
    robots: { index: true, follow: true },
  };
}

export const orgLd = {
  "@type": "Organization", "@id": `${SITE_URL}/#org`, name: SITE_NAME, url: SITE_URL, logo: `${SITE_URL}/favicon.svg`,
  contactPoint: { "@type": "ContactPoint", telephone: WHATSAPP_PHONE, contactType: "customer service", areaServed: "PY", availableLanguage: "es" },
};

export function Ld({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function faqLd(faq: { q: string; a: string }[]) {
  return { "@type": "FAQPage", mainEntity: faq.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
}

export function SiteNav() {
  return <nav className="land-nav wrap">
    <Link className="brand" href="/"><span className="brand-mark"><MessageSquareText size={21}/></span><span>nexo<span className="brand-dot">sms</span></span></Link>
    <div className="land-links"><Link href="/sms-masivo-paraguay">SMS masivo</Link><Link href="/sms-marketing">Marketing</Link><Link href="/api-sms">API</Link><Link href="/precios-sms">Precios</Link></div>
    <div className="land-actions"><Link className="land-login" href="/login">Ingresar</Link><Link className="btn btn-light" href="/register">Crear cuenta</Link></div>
  </nav>;
}

export function SiteFooter({ pages }: { pages: SeoPage[] }) {
  return <footer className="seo-footer wrap">
    <div className="seo-footer-grid">
      <div><Link className="brand" href="/"><span className="brand-mark"><MessageSquareText size={20}/></span><span>nexo<span className="brand-dot">sms</span></span></Link><p>Plataforma de SMS masivos para Paraguay: campañas, API y reportes para empresas.</p></div>
      <div><h3>Servicios</h3>{pages.slice(0, 7).map(p => <Link key={p.slug} href={`/${p.slug}`}>{p.label}</Link>)}</div>
      <div><h3>Más</h3>{pages.slice(7).map(p => <Link key={p.slug} href={`/${p.slug}`}>{p.label}</Link>)}<Link href="/docs">Documentación API</Link></div>
      <div><h3>Legal</h3><Link href="/privacidad">Privacidad</Link><Link href="/terminos">Términos</Link><Link href="/login">Ingresar</Link></div>
    </div>
    <small>© 2026 NexoSMS · SMS masivo en todo Paraguay</small>
  </footer>;
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return <div className="seo-faq">{items.map(f => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</div>;
}

export default function SeoPageView({ page, price }: { page: SeoPage; price?: number }) {
  const all = seoPages(price);
  const url = abs(`/${page.slug}`);
  const related = page.related.map(slug => all.find(p => p.slug === slug)!).filter(Boolean);
  const ld = { "@context": "https://schema.org", "@graph": [
    orgLd,
    { "@type": "WebPage", "@id": `${url}#page`, url, name: page.title, description: page.description, inLanguage: "es-PY", isPartOf: { "@id": `${SITE_URL}/#site` }, dateModified: LAST_MOD },
    { "@type": "Service", name: page.keyword, serviceType: "Envío de SMS", provider: { "@id": `${SITE_URL}/#org` }, areaServed: { "@type": "Country", name: "Paraguay" }, url },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL }, { "@type": "ListItem", position: 2, name: page.label, item: url }] },
    faqLd(page.faq),
  ] };
  return <main className="landing seo-page">
    <Ld data={ld} />
    <SiteNav />
    <header className="seo-hero wrap">
      <nav aria-label="Ruta" className="seo-crumbs"><Link href="/">Inicio</Link> / <span>{page.label}</span></nav>
      <h1>{page.h1}</h1>
      <p className="seo-lead">{page.lead}</p>
      <div className="hero-buttons"><Link className="btn btn-primary" href="/register">Crear cuenta gratis</Link><Link className="btn btn-outline" href="/docs">Ver documentación API</Link></div>
    </header>
    <div className="seo-body wrap">
      {page.sections.map(s => <section key={s.h2}>
        <h2>{s.h2}</h2>
        {s.p?.map(t => <p key={t}>{t}</p>)}
        {s.ul && <ul>{s.ul.map(t => <li key={t}>{t}</li>)}</ul>}
        {s.example && <figure className="seo-sms"><div className="bubble">{s.example}</div><figcaption>{s.exampleLabel} · {prepareSms(s.example.replace(/\{[a-z]+\}/g, "María González")).length}/{SMS_MAX} caracteres</figcaption></figure>}
        {s.code?.map(c => <div key={c.lang} className="seo-code"><b>{c.lang}</b><pre><code>{c.text}</code></pre></div>)}
      </section>)}
      <section><h2>Preguntas frecuentes</h2><Faq items={page.faq} /></section>
      <section className="seo-cta"><div><h2>Empezá a enviar SMS hoy</h2><p>Creá tu cuenta, cargá créditos y enviá tu primera campaña en minutos.</p></div><Link className="btn btn-primary" href="/register">Crear mi cuenta</Link></section>
      <section><h2>Más información</h2><div className="seo-related">{related.map(r => <Link key={r.slug} href={`/${r.slug}`}><b>{r.label}</b><span>{r.description}</span></Link>)}</div></section>
    </div>
    <SiteFooter pages={all} />
  </main>;
}
