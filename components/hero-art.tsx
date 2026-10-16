import { BarChart3, Check, ChevronLeft, Contact, LayoutDashboard, MapPin, Send, Wallet } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";

/** Teléfono con un SMS de ejemplo (respeta las reglas de la plataforma: sin emojis, menos de 160 caracteres). */
export function PhoneMock() {
  return <div className="phone" role="img" aria-label="Ejemplo de SMS con enlace a WhatsApp">
    <div className="phone-screen">
      <div className="phone-island" />
      <div className="phone-status"><b>9:41</b><span><i /><i /><i /></span></div>
      <div className="phone-head"><ChevronLeft size={18} aria-hidden /><span className="phone-avatar">N</span><b>NEXO SMS</b></div>
      <div className="phone-chat">
        <div className="bubble phone-bubble">Hola, aprovechá nuestras promociones especiales solo por hoy.<br /><br />Consultá por WhatsApp haciendo clic aquí:<br /><u>https://wa.me/595981234567</u><br /><br />NEXO SMS. Tu aliado en comunicación.<small>10:24</small></div>
      </div>
      <div className="phone-input"><span>Mensaje de texto</span><i><Send size={14} aria-hidden /></i></div>
    </div>
  </div>;
}

const BARS = [38, 52, 44, 66, 58, 82, 100];
/** Vista de ejemplo del panel (cifras ilustrativas). */
export function DashMock() {
  const items = [[LayoutDashboard, "Resumen", true], [Send, "Campañas"], [Contact, "Contactos"], [BarChart3, "Reportes"], [Wallet, "Saldo y compras"]] as const;
  return <div className="dash" aria-hidden="true">
    <aside><b className="dash-logo">NE<em>X</em>O <span>SMS</span></b>{items.map(([Icon, label, on]) => <span key={label} className={on ? "on" : ""}><Icon size={13} />{label}</span>)}</aside>
    <div className="dash-main">
      <header><b>Resumen de envíos</b><span>Vista de ejemplo</span></header>
      <div className="dash-stats">
        <div><small>Mensajes enviados</small><b>12.430</b></div>
        <div><small>Aceptados</small><b>99,2%</b></div>
        <div><small>Contactos</small><b>8.215</b></div>
        <div><small>Créditos</small><b>4.570</b></div>
      </div>
      <div className="dash-row">
        <div className="dash-chart"><small>Actividad de los últimos 7 días</small><div>{BARS.map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}</div></div>
        <div className="dash-list"><small>Campañas recientes</small>
          <p><span>Promo de octubre</span><em>Completada</em></p><p><span>Recordatorio de cuotas</span><em className="b">En curso</em></p><p><span>Clientes nuevos</span><em className="g">Borrador</em></p></div>
      </div>
    </div>
  </div>;
}

export function WaCard() {
  return <div className="wa-card"><span className="wa-card-icon"><WhatsAppIcon size={26} /></span><div><b>Más ventas con un solo mensaje</b><p>Incluí tu enlace de WhatsApp en tus campañas de SMS.</p></div></div>;
}

/** Silueta aproximada de Paraguay con un pin en Asunción. */
export function ParaguayMap() {
  return <div className="py-map" aria-hidden="true">
    <svg viewBox="0 0 160 150"><path d="M64 4 77 12 79 38 105 40 118 62 130 70 126 92 134 112 121 124 96 126 82 118 66 120 46 110 36 98 18 78 22 52 38 40 50 14Z" /><path className="route" d="M12 128C40 112 60 100 78 92" /></svg>
    <MapPin className="pin" size={22} fill="currentColor" />
    <span>Cobertura en todo el Paraguay</span>
  </div>;
}

export function OperatorCard({ name, href }: { name: string; href: string }) {
  return <a className={`op op-${name.toLowerCase()}`} href={href}><b>{name}</b><span><Check size={13} aria-hidden />Cobertura total</span></a>;
}
