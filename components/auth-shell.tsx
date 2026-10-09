import Link from "@/components/plain-link";
import { Brand } from "@/components/site-chrome";
import ThemeToggle from "@/components/theme-toggle";

export default function AuthShell({ title, lead, quote, quoteNote, children }: { title: string; lead: string; quote: string; quoteNote: string; children: React.ReactNode }) {
  return <main className="auth">
    <div className="auth-main">
      <div className="auth-top"><Brand /><ThemeToggle /></div>
      <div className="auth-card"><h1>{title}</h1><p>{lead}</p>{children}</div>
      <small className="auth-foot">© 2026 NexoSMS. <Link href="/privacidad">Privacidad</Link> y <Link href="/terminos">términos</Link>.</small>
    </div>
    <aside className="auth-side" aria-hidden><blockquote>{quote}</blockquote><p>{quoteNote}</p><div className="bubble">Hola, tu pedido está listo. ¡Gracias por elegirnos!</div></aside>
  </main>;
}
