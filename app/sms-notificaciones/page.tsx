import SeoPageView, { pageMetadata } from "@/components/seo-page";
import { getPrice } from "@/lib/price";
import { seoPages } from "@/lib/seo-pages";

export const dynamic = "force-dynamic";
const SLUG = "sms-notificaciones";
const find = (price: number) => seoPages(price).find(p => p.slug === SLUG)!;

export async function generateMetadata() { return pageMetadata(find(await getPrice())); }
export default async function Page() { const price = await getPrice(); return <SeoPageView page={find(price)} price={price} />; }
