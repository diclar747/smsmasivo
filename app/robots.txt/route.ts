import { SITE_URL } from "@/lib/site";

export function GET() {
  const body = `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /panel\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
