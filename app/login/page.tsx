"use client";
import Link from "@/components/plain-link";
import { useEffect, useState } from "react";
import AuthShell from "@/components/auth-shell";

export default function Login() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const [google,setGoogle]=useState(false);
  useEffect(()=>{fetch("/api/bootstrap").then(r=>r.json() as Promise<{googleAvailable?:boolean}>).then(d=>setGoogle(!!d.googleAvailable)).catch(()=>{})},[]);
  async function submit(e: React.FormEvent) { e.preventDefault(); setBusy(true); setError(""); try { const r = await fetch("/api/auth/login", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email,password}) }); const d = await r.json() as {error?:string}; if (!r.ok) throw new Error(d.error); window.location.assign("/panel"); } catch(e) { setError(e instanceof Error ? e.message : "No se pudo ingresar"); } finally { setBusy(false); } }
  return <AuthShell title="Ingresá a tu cuenta" lead="Todo tu SMS en un solo panel." quote="Cada conversación empieza con un mensaje." quoteNote="Campañas, contactos y reportes en un solo lugar.">
    <form onSubmit={submit}>
      <label>Correo electrónico<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@empresa.com"/></label>
      <label>Contraseña<input type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Tu contraseña"/></label>
      {error&&<div className="form-error" role="alert">{error}</div>}
      <button className="btn btn-primary" disabled={busy}>{busy?"Ingresando...":"Ingresar"}</button>
    </form>
    <div className="auth-divider"><span>o continuá con</span></div>
    {google?<a className="google-btn" href="/api/auth/google"><span>G</span> Google</a>:<div className="google-btn disabled"><span>G</span> Google, próximamente</div>}
    <p className="auth-switch">¿No tenés cuenta? <Link href="/register">Registrate</Link></p>
  </AuthShell>;
}
