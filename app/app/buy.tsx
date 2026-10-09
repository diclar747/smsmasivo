"use client";
import { useState } from "react";
import { CreditCard, QrCode, ShieldCheck } from "lucide-react";
import { fmt, request } from "./shared";

type Props = { pricePerCredit: number; minCredits: number; maxCredits: number; live: boolean; flash: (s: string) => void };
const PRESETS = [1000, 2500, 5000, 10000, 25000, 50000, 100000];
const SLIDER_MAX = 100000;

/** Compra libre: el usuario elige cuántos SMS quiere (mínimo 1.000) y paga con tarjeta o QR. 1 SMS = 1 crédito. */
export default function BuyCredits({ pricePerCredit, minCredits, maxCredits, live, flash }: Props) {
  const [sms, setSms] = useState(Math.max(minCredits, 5000));
  const [text, setText] = useState(fmt(Math.max(minCredits, 5000)));
  const [busy, setBusy] = useState(false);
  const price = sms * pricePerCredit;
  const tooLow = sms < minCredits, tooHigh = sms > maxCredits;
  const valid = !tooLow && !tooHigh;
  const presets = PRESETS.filter(n => n >= minCredits && n <= maxCredits);

  const choose = (n: number) => { setSms(n); setText(fmt(n)); };
  const typed = (v: string) => { const n = Number(v.replace(/\D/g, "")) || 0; setSms(n); setText(n ? fmt(n) : ""); };
  const sliderMax = Math.min(SLIDER_MAX, maxCredits);
  const sliderVal = Math.min(sliderMax, Math.max(minCredits, sms));

  async function pay() {
    setBusy(true);
    try { const d = await request("orders", "POST", { credits: sms }); location.href = d.paymentUrl; }
    catch (e) { flash(e instanceof Error ? e.message : "No se pudo generar el pago"); setBusy(false); }
  }

  return <div className="buy">
    <div className="buy-main">
      <div className="buy-presets">{presets.map(n => <button key={n} className={sms === n ? "on" : ""} onClick={() => choose(n)}><b>{fmt(n)} SMS</b><small>Gs. {fmt(n * pricePerCredit)}</small></button>)}</div>
      <label className="buy-field">¿Otra cantidad? Escribí cuántos SMS querés
        <span className="buy-input"><input inputMode="numeric" value={text} onChange={e => typed(e.target.value)} placeholder="0" aria-label="Cantidad de SMS" /><i>SMS</i></span>
      </label>
      {(tooLow || tooHigh) && sms > 0 && <div className="buy-err">{tooLow ? `La compra mínima es de ${fmt(minCredits)} SMS.` : `La compra máxima es de ${fmt(maxCredits)} SMS.`}</div>}
      <input className="buy-range" type="range" min={minCredits} max={sliderMax} step={500} value={sliderVal} onChange={e => choose(Number(e.target.value))} aria-label="Cantidad de SMS" style={{ ["--fill" as string]: `${(sliderVal - minCredits) / Math.max(1, sliderMax - minCredits) * 100}%` }} />
      <div className="buy-scale"><span>{fmt(minCredits)} SMS</span><span>{fmt(sliderMax)} SMS</span></div>
    </div>
    <aside className="buy-total">
      <small>Vas a pagar</small><strong>Gs. {fmt(price)}</strong>
      <div className="buy-get"><span>Recibís</span><b>{fmt(sms)} SMS</b><small>= {fmt(sms)} créditos</small></div>
      <ul><li>Precio: Gs. {fmt(pricePerCredit)} por SMS</li><li>1 SMS = 1 crédito (hasta 160 caracteres)</li><li>Los créditos no vencen</li></ul>
      <button className="dx-btn" disabled={busy || !live || !valid} onClick={pay}><CreditCard size={16} /> {busy ? "Generando pago…" : "Pagar con tarjeta o QR"}</button>
      {!live && <p className="buy-off">Los pagos online todavía no están activados en esta cuenta.</p>}
      <div className="buy-note"><QrCode size={15} /><ShieldCheck size={15} /> Pagás en el checkout seguro de Winsap. Apenas se confirma el pago, tu saldo se acredita solo.</div>
    </aside>
  </div>;
}
