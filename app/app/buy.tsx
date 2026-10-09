"use client";
import { useState } from "react";
import { CreditCard, QrCode, ShieldCheck } from "lucide-react";
import { fmt, request } from "./shared";

type Props = { pricePerCredit: number; minPurchase: number; maxPurchase: number; live: boolean; flash: (s: string) => void };

/** Compra libre de créditos: el usuario elige la cantidad con la barra y paga con tarjeta o QR. */
export default function BuyCredits({ pricePerCredit, minPurchase, maxPurchase, live, flash }: Props) {
  const minCredits = Math.ceil(minPurchase / pricePerCredit);
  const maxCredits = Math.floor(maxPurchase / pricePerCredit);
  const sliderMax = Math.min(maxCredits, Math.ceil(500000 / pricePerCredit));
  const [credits, setCredits] = useState(Math.min(maxCredits, Math.max(minCredits, Math.ceil(10000 / pricePerCredit))));
  const [busy, setBusy] = useState(false);
  const clamp = (n: number) => Math.min(maxCredits, Math.max(minCredits, Math.round(n) || minCredits));
  const price = credits * pricePerCredit;
  const presets = [minPurchase, 5000, 10000, 25000, 50000, 100000].map(gs => clamp(Math.ceil(gs / pricePerCredit)));

  async function pay() {
    setBusy(true);
    try { const d = await request("orders", "POST", { credits }); location.href = d.paymentUrl; }
    catch (e) { flash(e instanceof Error ? e.message : "No se pudo generar el pago"); setBusy(false); }
  }

  return <div className="buy">
    <div className="buy-main">
      <div className="buy-amount"><span>Vas a comprar</span><strong>{fmt(credits)}</strong><small>créditos · {fmt(credits)} SMS</small></div>
      <input className="buy-range" type="range" min={minCredits} max={sliderMax} step={1} value={Math.min(credits, sliderMax)} onChange={e => setCredits(clamp(Number(e.target.value)))} aria-label="Cantidad de créditos" style={{ ["--fill" as string]: `${(Math.min(credits, sliderMax) - minCredits) / Math.max(1, sliderMax - minCredits) * 100}%` }} />
      <div className="buy-scale"><span>Mín. Gs. {fmt(minPurchase)}</span><span>Gs. {fmt(sliderMax * pricePerCredit)}</span></div>
      <div className="buy-presets">{presets.map((c, i) => <button key={i} className={credits === c ? "on" : ""} onClick={() => setCredits(c)}><b>Gs. {fmt(c * pricePerCredit)}</b><small>{fmt(c)} créditos</small></button>)}</div>
      <label className="buy-custom">¿Otra cantidad? Escribí los créditos<input type="number" min={minCredits} max={maxCredits} value={credits} onChange={e => setCredits(clamp(Number(e.target.value)))} /></label>
    </div>
    <aside className="buy-total">
      <small>Total a pagar</small><strong>Gs. {fmt(price)}</strong>
      <ul><li>1 crédito = 1 SMS (hasta 160 caracteres)</li><li>Precio: Gs. {fmt(pricePerCredit)} por crédito</li><li>Los créditos no vencen</li></ul>
      <button className="dx-btn" disabled={busy || !live} onClick={pay}><CreditCard size={16} /> {busy ? "Generando pago…" : "Pagar con tarjeta o QR"}</button>
      {!live && <p className="buy-off">Los pagos online todavía no están activados en esta cuenta.</p>}
      <div className="buy-note"><QrCode size={15} /><ShieldCheck size={15} /> Pagás en el checkout seguro de Winsap. Apenas se confirma el pago, tu saldo se acredita solo.</div>
    </aside>
  </div>;
}
