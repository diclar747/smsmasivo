"use client";
import Link from "@/components/plain-link";
import { useEffect, useState } from "react";
import AuthShell from "@/components/auth-shell";
export default function Register() { const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState(""); const [busy,setBusy]=useState(false); const [google,setGoogle]=useState(false);
  useEffect(()=>{fetch("/api/bootstrap").then(r=>r.json() as Promise<{googleAvailable?:boolean}>).then(d=>setGoogle(!!d.googleAvailable)).catch(()=>{})},[]);
  async function submit(e:React.FormEvent) { e.preventDefault(); setBusy(true); setError(""); try { const r=await fetch("/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,email,password})}); const d=await r.json() as {error?:string}; if(!r.ok) throw new Error(d.error); window.location.assign("/panel"); } catch(e) {setError(e instanceof Error?e.message:"No se pudo registrar");} finally {setBusy(false);} }
  return <AuthShell title="Creá tu cuenta" lead="Tu plataforma SMS está a unos pasos." quote="Tu próximo mensaje puede llegar más lejos." quoteNote="Sin mensualidad. Pagás solo los SMS que enviás.">
    <form onSubmit={submit}>
      <label>Nombre o empresa<input required autoComplete="organization" value={name} onChange={e=>setName(e.target.value)} placeholder="Nombre de tu empresa"/></label>
      <label>Correo electrónico<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@empresa.com"/></label>
      <label>Contraseña<input type="password" minLength={10} required autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mínimo 10 caracteres"/></label>
      {error&&<div className="form-error" role="alert">{error}</div>}
      <button className="btn btn-primary" disabled={busy}>{busy?"Creando...":"Crear cuenta"}</button>
    </form>
    <div className="auth-divider"><span>o registrate con</span></div>
    {google?<a className="google-btn" href="/api/auth/google"><span>G</span> Google</a>:<div className="google-btn disabled"><span>G</span> Google, próximamente</div>}
    <p className="auth-switch">¿Ya tenés cuenta? <Link href="/login">Ingresá</Link></p>
  </AuthShell>;
}
