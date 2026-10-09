import type { Metadata } from "next";
import "./globals.css";
import "./extra.css";
import "./docs.css";
import "./dash.css";
import "./seo.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://nexosms.cnid.com.py"),
  title: { default: "NexoSMS | SMS masivo para Paraguay", template: "%s" },
  description: "SMS masivos en Paraguay: campañas, recordatorios, notificaciones y API para empresas.",
  applicationName: "NexoSMS",
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-PY">
      <body className="antialiased">
        {children}
        <a className="wa-float" href="https://wa.me/595994854167?text=Hola%2C%20quiero%20hacer%20una%20consulta%20sobre%20NexoSMS" target="_blank" rel="noopener noreferrer" aria-label="Consultas por WhatsApp sobre NexoSMS" title="Consultas por WhatsApp">
          <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true" fill="currentColor"><path d="M16.04 3C9.4 3 4 8.38 4 15.02c0 2.12.55 4.19 1.6 6.02L4 29l8.14-1.56a12.03 12.03 0 0 0 3.9.65h.01C22.68 28.09 28 22.7 28 16.06 28 9.4 22.68 3 16.04 3Zm0 22.03h-.01c-1.2 0-2.38-.32-3.4-.93l-.24-.15-4.83.93.95-4.7-.16-.25a9.95 9.95 0 0 1-1.53-5.3c0-5.5 4.5-9.97 10.03-9.97 5.52 0 10.02 4.47 10.02 9.98 0 5.5-4.5 10.39-10.03 10.39Zm5.5-7.47c-.3-.15-1.78-.88-2.06-.98-.27-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.18-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.18-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.64-.93-2.25-.24-.58-.5-.5-.68-.51h-.58c-.2 0-.53.08-.8.38-.28.3-1.05 1.03-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.23 5.13 4.53.72.31 1.28.5 1.71.64.72.23 1.37.2 1.89.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35Z"/></svg>
          <span>¿Consultas? Escribinos</span>
        </a>
      </body>
    </html>
  );
}
