export const SITE_URL = "https://nexosms.cnid.com.py";
export const SITE_NAME = "NexoSMS";
export const WHATSAPP_URL = "https://wa.me/595994854167?text=Hola%2C%20quiero%20hacer%20una%20consulta%20sobre%20NexoSMS";
export const WHATSAPP_PHONE = "+595994854167";
export const DEFAULT_PRICE = 130; // Gs por SMS (PRICE_PER_CREDIT)
export const MIN_SMS = 1000;
export const LAST_MOD = "2026-10-09";
export const abs = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;
