import Link from "@/components/plain-link";

/** Logotipo SMS Masivo: globo de mensaje con ondas de envío + palabra "SMS Masivo". */
export function LogoMark({ className = "logo-mark" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
    <defs><linearGradient id="lgm" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#1f5eea" /><stop offset="1" stopColor="#7b4dff" /></linearGradient></defs>
    <rect width="48" height="48" rx="14" fill="url(#lgm)" />
    <path d="M11 16.5A5.5 5.5 0 0 1 16.5 11h15a5.5 5.5 0 0 1 5.5 5.5v10a5.5 5.5 0 0 1-5.5 5.5H21l-6.5 5.5V32A5.5 5.5 0 0 1 11 26.5v-10Z" fill="#fff" />
    <circle cx="18" cy="21.5" r="2.2" fill="#1f5eea" /><circle cx="24" cy="21.5" r="2.2" fill="#4c55f5" /><circle cx="30" cy="21.5" r="2.2" fill="#7b4dff" />
  </svg>;
}

export default function Logo({ tagline = false, href = "/" }: { tagline?: boolean; href?: string }) {
  return <Link className="logo" href={href} aria-label="SMS Masivo, inicio">
    <span className="logo-top">
      <LogoMark />
      <span className="logo-word">SMS</span>
      <span className="logo-sms">Masivo</span>
    </span>
    {tagline && <span className="logo-tag">SMS MASIVOS · PARAGUAY</span>}
  </Link>;
}
