export const SITE_URL = "https://smsmasivo.cd.com.py";
export const SITE_NAME = "SMS Masivo";
export const WHATSAPP_URL = "https://wa.me/595994854167?text=Hola%2C%20quiero%20hacer%20una%20consulta%20sobre%20SMS%20Masivo";
export const WHATSAPP_PHONE = "+595994854167";
export const DEFAULT_PRICE = 130; // Gs por SMS (PRICE_PER_CREDIT)
export const MIN_SMS = 1000;
export const LAST_MOD = "2026-11-24";
export const SITE_TAGLINE = "Envío de SMS masivos en Paraguay";
export const SITE_DESCRIPTION = "SMS Masivo: plataforma de SMS masivos en Paraguay. Campañas de SMS, SMS marketing, cobranzas, recordatorios, códigos OTP y API para empresas. Enviá a Tigo, Claro, Personal y Vox, sin mensualidad.";
export const LOGO_URL = `${SITE_URL}/logo.png`;
/** Búsquedas que el sitio quiere posicionar (meta keywords y datos estructurados). */
export const KEYWORDS = [
  "SMS masivo", "SMS masivos", "SMS masivo Paraguay", "SMS Paraguay", "envío de SMS masivos", "enviar SMS masivos",
  "mensajes de texto masivos", "mensajería masiva", "plataforma de SMS", "servicio de SMS", "campañas de SMS", "campaña SMS",
  "SMS marketing", "SMS publicitarios", "publicidad por SMS", "lista de contactos SMS", "difusión por SMS", "SMS para empresas",
  "SMS empresarial", "SMS corporativo", "SMS Tigo", "SMS Claro", "SMS Personal", "SMS Vox", "API SMS", "API de SMS Paraguay",
  "SMS OTP", "SMS de verificación", "SMS de cobranza", "recordatorios por SMS", "notificaciones por SMS", "SMS con enlace a WhatsApp",
  "SMS premium", "enviar SMS desde la web", "bulk SMS Paraguay", "SMS Asunción", "precio SMS Paraguay",
];
export const abs = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;
