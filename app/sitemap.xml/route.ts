import { LAST_MOD, SITE_URL } from "@/lib/site";
import { PAGE_SLUGS } from "@/lib/seo-pages";

const urls: [string, string, string][] = [
  ["/", "1.0", "weekly"],
  ...PAGE_SLUGS.map((s): [string, string, string] => [`/${s}`, s === "sms-masivo-paraguay" || s === "precios-sms" ? "0.9" : "0.8", "monthly"]),
  ["/docs", "0.7", "monthly"], ["/privacidad", "0.3", "yearly"], ["/terminos", "0.3", "yearly"],
];

export function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([p, pr, cf]) => `  <url><loc>${SITE_URL}${p === "/" ? "/" : p}</loc><lastmod>${LAST_MOD}</lastmod><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`).join("\n")}\n</urlset>\n`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
