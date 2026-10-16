import Link from "@/components/plain-link";

/** Logotipo NEXO SMS con la X cruzada. El texto usa la tipografía del sitio. */
export default function Logo({ tagline = false, href = "/" }: { tagline?: boolean; href?: string }) {
  return <Link className="logo" href={href} aria-label="NexoSMS, inicio">
    <span className="logo-top">
      <span className="logo-word">NE<svg className="logo-x" viewBox="0 0 36 36" aria-hidden="true"><defs><linearGradient id="lgx" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#1f5eea" /><stop offset="1" stopColor="#7b4dff" /></linearGradient></defs><path d="M5 4.5 31 31.5" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" fill="none" /><path d="M31 4.5 5 31.5" stroke="url(#lgx)" strokeWidth="6.5" strokeLinecap="round" fill="none" /></svg>O</span>
      <span className="logo-sms">SMS</span>
    </span>
    {tagline && <span className="logo-tag">CONECTA · COMUNICA · CRECE</span>}
  </Link>;
}
