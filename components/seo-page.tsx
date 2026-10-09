import type { Metadata } from "next";
import Link from "@/components/plain-link";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { prepareSms, SMS_MAX } from "@/lib/sms-text";
import { abs, DEFAULT_PRICE, LAST_MOD, SITE_NAME, SITE_URL, WHATSAPP_PHONE } from "@/lib/site";
import { blurb, type SeoPage, seoPages } from "@/lib/seo-pages";

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

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return <div className="faq">{items.map(f => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</div>;
}

export default function SeoPageView({ page, price }: { page: SeoPage; price?: number }) {
  const all = seoPages(price);
  const url = abs(`/${page.slug}`);
  const related = page.related.map(slug => all.find(p => p.slug === slug)!).filter(Boolean);
  const gs = (price ?? DEFAULT_PRICE).toLocaleString("es-PY").replace(/,/g, ".");
  const ld = { "@context": "https://schema.org", "@graph": [
    orgLd,
    { "@type": "WebPage", "@id": `${url}#page`, url, name: page.title, description: page.description, inLanguage: "es-PY", isPartOf: { "@id": `${SITE_URL}/#site` }, dateModified: LAST_MOD },
    { "@type": "Service", name: page.keyword, serviceType: "Envío de SMS", provider: { "@id": `${SITE_URL}/#org` }, areaServed: { "@type": "Country", name: "Paraguay" }, url },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL }, { "@type": "ListItem", position: 2, name: page.label, item: url }] },
    faqLd(page.faq),
  ] };
  return <div className="site">
    <Ld data={ld} />
    <SiteNav />
    <main className="container">
      <header className="seo-hero">
        <nav aria-label="Ruta" className="crumbs"><Link href="/">Inicio</Link> / <span>{page.label}</span></nav>
        <h1>{page.h1}</h1>
        <p className="lead">{page.lead}</p>
      </header>
      <div className="seo-layout">
        <article className="prose">
          {page.sections.map(s => <section key={s.h2}>
            <h2>{s.h2}</h2>
            {s.p?.map(t => <p key={t}>{t}</p>)}
            {s.ul && <ul>{s.ul.map(t => <li key={t}>{t}</li>)}</ul>}
            {s.example && <figure className="sms-example"><div className="bubble">{s.example}</div><figcaption>{s.exampleLabel}: {prepareSms(s.example.replace(/\{[a-z]+\}/g, "María González")).length}/{SMS_MAX} caracteres</figcaption></figure>}
            {s.code?.map(c => <div key={c.lang} className="snippet"><b>{c.lang}</b><pre><code>{c.text}</code></pre></div>)}
          </section>)}
          <section><h2>Preguntas frecuentes</h2><Faq items={page.faq} /></section>
          <section><h2>Más información</h2><div className="related">{related.map(r => <Link key={r.slug} href={`/${r.slug}`}><b>{r.label}</b><span>{blurb(r.description)}</span></Link>)}</div></section>
        </article>
        <aside className="seo-aside"><div className="aside-price">Gs. {gs}<small> por SMS</small></div><p>Prepago, sin mensualidad. Los créditos no vencen.</p><Link className="btn btn-primary" href="/register">Crear cuenta gratis</Link><Link className="btn btn-ghost" href="/docs">Ver la API</Link></aside>
      </div>
      <div className="cta-band"><div><h2>Empezá a enviar SMS hoy</h2><p>Creá tu cuenta, cargá créditos y enviá tu primera campaña en minutos.</p></div><Link className="btn btn-primary btn-lg" href="/register">Crear mi cuenta</Link></div>
    </main>
    <SiteFooter pages={all} />
  </div>;
}
