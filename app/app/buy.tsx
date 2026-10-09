"use client";
import { useState } from "react";
import { CreditCard, QrCode, ShieldCheck } from "lucide-react";
import { fmt, request } from "./shared";

type Props = { pricePerCredit: number; minPurchase: number; maxPurchase: number; live: boolean; flash: (s: string) => void };
const PRESETS = [1000, 2500, 5000, 10000, 25000, 50000, 100000];
const SLIDER_MAX = 500000;

/** Compra libre: el usuario elige cuántos guaraníes quiere cargar (mínimo 1.000) y paga con tarjeta o QR. */
export default function BuyCredits({ pricePerCredit, minPurchase, maxPurchase, live, flash }: Props) {
  const [amount, setAmount] = useState(10000);
  const [text, setText] = useState("10.000");
  const [busy, setBusy] = useState(false);
  const credits = Math.floor(amount / pricePerCredit);
  const tooLow = amount < minPurchase, tooHigh = amount > maxPurchase;
  const valid = !tooLow && !tooHigh && credits >= 1;

  const choose = (n: number) => { setAmount(n); setText(fmt(n)); };
  const typed = (v: string) => { const n = Number(v.replace(/\D/g, "")) || 0; setAmount(n); setText(n ? fmt(n) : ""); };
  const sliderVal = Math.min(SLIDER_MAX, Math.max(minPurchase, amount));

  async function pay() {
    setBusy(true);
    try { const d = await request("orders", "POST", { amount }); location.href = d.paymentUrl; }
    catch (e) { flash(e instanceof Error ? e.message : "No se pudo generar el pago"); setBusy(false); }
  }

  return <div className="buy">
    <div className="buy-main">
      <div className="buy-presets">{PRESETS.map(n => <button key={n} className={amount === n ? "on" : ""} onClick={() => choose(n)}><b>Gs. {fmt(n)}</b><small>{fmt(Math.floor(n / pricePerCredit))} SMS</small></button>)}</div>
      <label className="buy-field">¿Otro monto? Escribí cuánto querés cargar
        <span className="buy-input"><i>Gs.</i><input inputMode="numeric" value={text} onChange={e => typed(e.target.value)} placeholder="0" aria-label="Monto en guaraníes" /></span>
      </label>
      {(tooLow || tooHigh) && amount > 0 && <div className="buy-err">{tooLow ? `La compra mínima es de Gs. ${fmt(minPurchase)}.` : `La compra máxima es de Gs. ${fmt(maxPurchase)}.`}</div>}
      <input className="buy-range" type="range" min={minPurchase} max={SLIDER_MAX} step={1000} value={sliderVal} onChange={e => choose(Number(e.target.value))} aria-label="Monto a cargar" style={{ ["--fill" as string]: `${(sliderVal - minPurchase) / (SLIDER_MAX - minPurchase) * 100}%` }} />
      <div className="buy-scale"><span>Gs. {fmt(minPurchase)}</span><span>Gs. {fmt(SLIDER_MAX)}</span></div>
    </div>
    <aside className="buy-total">
      <small>Vas a pagar</small><strong>Gs. {fmt(amount)}</strong>
      <div className="buy-get"><span>Recibís</span><b>{fmt(credits)} créditos</b><small>= {fmt(credits)} SMS</small></div>
      <ul><li>1 SMS = 1 crédito (hasta 160 caracteres)</li><li>Precio: Gs. {fmt(pricePerCredit)} por SMS</li><li>Los créditos no vencen</li></ul>
      <button className="dx-btn" disabled={busy || !live || !valid} onClick={pay}><CreditCard size={16} /> {busy ? "Generando pago…" : "Pagar con tarjeta o QR"}</button>
      {!live && <p className="buy-off">Los pagos online todavía no están activados en esta cuenta.</p>}
      <div className="buy-note"><QrCode size={15} /><ShieldCheck size={15} /> Pagás en el checkout seguro de Winsap. Apenas se confirma el pago, tu saldo se acredita solo.</div>
    </aside>
  </div>;
}
