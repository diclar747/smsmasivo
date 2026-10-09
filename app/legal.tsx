import Link from "next/link";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "48px 20px 80px", lineHeight: 1.7 }}>
      <Link href="/" style={{ fontSize: 14, opacity: 0.7 }}>← NexoSMS</Link>
      <h1 style={{ fontSize: 32, fontWeight: 700, margin: "16px 0 4px" }}>{title}</h1>
      <p style={{ opacity: 0.6, fontSize: 14, marginBottom: 32 }}>Última actualización: {updated}</p>
      {children}
    </main>
  );
}
export const H = ({ children }: { children: React.ReactNode }) => <h2 style={{ fontSize: 20, fontWeight: 600, margin: "28px 0 8px" }}>{children}</h2>;
export const P = ({ children }: { children: React.ReactNode }) => <p style={{ margin: "0 0 12px" }}>{children}</p>;
