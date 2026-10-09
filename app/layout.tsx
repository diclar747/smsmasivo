import type { Metadata } from "next";
import "./globals.css";
import "./extra.css";
import "./docs.css";
import "./dash.css";

export const metadata: Metadata = {
  title: "NexoSMS | SMS masivo para Paraguay",
  description: "Campañas SMS, envíos programados, contactos, reportes y API para empresas en Paraguay.",
  other: {
    "codex-preview": "NexoSMS",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-PY">
      <body className="antialiased">{children}</body>
    </html>
  );
}
