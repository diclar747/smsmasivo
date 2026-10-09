import Link from "@/components/plain-link";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { seoPages } from "@/lib/seo-pages";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return <div className="site"><SiteNav />
    <main className="container"><article className="legal">
      <Link href="/" className="crumbs">Volver al inicio</Link>
      <h1>{title}</h1><p className="updated">Última actualización: {updated}</p>
      {children}
    </article></main>
    <SiteFooter pages={seoPages()} /></div>;
}
export const H = ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>;
export const P = ({ children }: { children: React.ReactNode }) => <p>{children}</p>;
