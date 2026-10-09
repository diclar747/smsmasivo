import Link from "next/link";
import ApiTester from "./tester";
import { ArrowLeft, ArrowUpRight, Code2, MessageSquareText } from "lucide-react";

const endpoints = [
  ["POST", "/api/auth/register", "Crear cuenta con nombre, correo y contraseña de al menos 10 caracteres."],
  ["POST", "/api/auth/login", "Iniciar sesión y recibir una cookie segura."],
  ["GET", "/api/me", "Consultar usuario y saldo."],
  ["POST", "/api/messages", "Enviar un SMS individual: phone, message (máximo 160 caracteres, 1 crédito; 422 si no cumple)."],
  ["GET", "/api/dashboard", "Métricas y actividad reciente."],
  ["GET", "/api/contacts", "Listar contactos."],
  ["POST", "/api/contacts", "Importar hasta 2000 contactos: contacts: [{phone,name,variables}]."],
  ["DELETE", "/api/contacts/:id", "Eliminar un contacto."],
  ["GET", "/api/campaigns", "Listar campañas."],
  ["POST", "/api/campaigns", "Crear campaña: name, body, recipients y scheduledAt opcional."],
  ["GET", "/api/campaigns/:id", "Ver detalle y destinatarios."],
  ["PUT", "/api/campaigns/:id", "Editar nombre, mensaje y horario de una campaña pendiente o pausada."],
  ["POST", "/api/campaigns/:id/pause", "Detener una campaña en curso o programada."],
  ["POST", "/api/campaigns/:id/cancel", "Cancelar definitivamente una campaña."],
  ["DELETE", "/api/campaigns/:id", "Eliminar la campaña y su lista de destinatarios (no se puede si está enviando)."],
  ["POST", "/api/campaigns/:id/run", "Procesar hasta 20 destinatarios; con now: true reanuda o envía sin esperar el horario. Repetir hasta remaining=0."],
  ["POST", "/api/campaigns/process", "Procesar campañas programadas que ya vencieron."],
  ["GET", "/api/reports", "Historial filtrable: from, to, campaign, status."],
  ["GET", "/api/wallet", "Saldo, movimientos, paquetes y compras."],
  ["POST", "/api/orders", "Crear link de pago por la cantidad de SMS elegida: credits (Gs. 130 por SMS, compra mínima 1.000 SMS)."],
  ["POST", "/api/orders/verify-pending", "Verificar pagos pendientes y acreditar los confirmados."],
  ["POST", "/api/orders/:id/verify", "Verificar pago y acreditar créditos si fue confirmado."],
  ["GET", "/api/optouts", "Listar números excluidos. Nunca se les envía SMS."],
  ["POST", "/api/optouts", "Excluir números: phone o phones: []."],
  ["DELETE", "/api/optouts/:id", "Quitar un número de la lista de exclusión."],
  ["GET", "/api/keys", "Listar claves sin revelar secretos."],
  ["POST", "/api/keys", "Crear clave API: name. Se muestra una sola vez."],
  ["DELETE", "/api/keys/:id", "Revocar una clave."],
];

export default function Docs() { return <main className="docs-page">
  <div className="docs-nav wrap"><Link className="brand" href="/"><span className="brand-mark"><MessageSquareText size={20}/></span><span>nexo<span className="brand-dot">sms</span></span></Link><Link href="/panel" className="btn btn-light">Ir al panel <ArrowUpRight size={16}/></Link></div>
  <div className="docs-hero wrap"><span className="label"><Code2 size={14}/> RECURSOS PARA DESARROLLADORES</span><h1>API de NexoSMS</h1><p>Enviá mensajes, administrá campañas y consultá saldo desde tu aplicación. Todas las rutas usan JSON y requieren HTTPS en producción.</p></div>
  <div className="docs-layout wrap"><aside><a href="#inicio">Inicio rápido</a><a href="#auth">Autenticación</a><a href="#probar">Probar en línea</a><a href="#reglas">Reglas del mensaje</a><a href="#endpoints">Endpoints</a><a href="#variables">Personalización</a><a href="#estados">Estados y créditos</a><a href="#errores">Errores</a></aside><article>
    <section id="inicio"><h2>Inicio rápido</h2><p>Generá una clave en <Link href="/panel">Panel → API</Link>. Enviá la clave en <code>X-API-Key</code>. En el navegador, la cookie de sesión se envía automáticamente.</p><pre className="docs-code">curl -X POST https://TU-DOMINIO/api/messages -H &quot;X-API-Key: sms_TU_CLAVE&quot; -H &quot;Content-Type: application/json&quot; -d &apos;{`{"phone":"595981234567","message":"Hola desde NexoSMS"}`}&apos;</pre><div className="docs-callout">Los números se normalizan al formato 5959XXXXXXXX. En modo demo el envío queda como <code>simulado</code>. En producción, <code>aceptado</code> indica recepción por la API de Winsap, no entrega final al dispositivo.</div></section>
    <section id="auth"><h2>Autenticación</h2><p>Usá <code>X-API-Key</code> para integraciones externas. Guardá la clave en el servidor de tu aplicación. Cada clave accede sólo a los datos de su usuario y puede revocarse desde el panel.</p></section>
    <section id="probar"><h2>Probar la API en línea</h2><p>Pegá tu API Key y probá cada operación contra tu cuenta real: consultar saldo, enviar un SMS, ver el historial y consultar campañas. Si el envío real está activo, <b>los SMS que envíes aquí son reales y consumen créditos</b>.</p><ApiTester/></section>
    <section id="reglas"><h2>Reglas del mensaje (siempre 1 crédito)</h2><p>Cada SMS admite hasta <b>160 caracteres</b> en alfabeto GSM-7. La API <b>nunca envía un mensaje más largo</b>: si lo supera responde <code>422</code> y no descuenta saldo, así no se consume un segundo crédito por accidente.</p><ul><li><b>Ñ y ¿ ¡:</b> se mantienen (son GSM-7). También <code>é è ù ì ò à ü ö ä</code>.</li><li><b>Acentos <code>á í ó ú</code> y similares:</b> se envían <u>sin tilde</u> (<code>á→a</code>) porque, si no, el SMS pasa a Unicode y el límite baja a 70 caracteres.</li><li><b>Comillas y guiones tipográficos</b> (<code>“ ” ‘ ’ – — …</code>) se convierten a sus equivalentes simples.</li><li><b>Caracteres especiales</b> <code>{ } [ ] ^ ~ \ | €</code> cuentan como <b>2</b> caracteres.</li><li><b>Emojis y símbolos sin equivalente</b> se rechazan con <code>422</code>; quitalos del texto.</li><li>En campañas, el límite se verifica <b>por destinatario con sus datos ya reemplazados</b> (<code>{'{nombre}'}</code>). Si alguno lo supera, la campaña no se crea y se indica un ejemplo.</li></ul></section>
    <section id="endpoints"><h2>Endpoints</h2><div className="endpoints">{endpoints.map(([method,path,description])=><div key={method+path}><div><span className={`method ${method.toLowerCase()}`}>{method}</span><code>{path}</code></div><p>{description}</p></div>)}</div><h3>Ejemplo de campaña</h3><pre className="docs-code">{JSON.stringify({name:"Recordatorio de citas",body:"Hola {nombre}, tu cita es el {fecha}.",scheduledAt:"2026-10-12T13:00:00Z",recipients:[{phone:"595981234567",name:"María",variables:{fecha:"12/10"}}]},null,2)}</pre><p>El procesamiento se realiza en lotes de hasta 20 destinatarios. El panel revisa campañas pendientes mientras está abierto. Para ejecutar sin el panel abierto, un programador externo debe invocar <code>POST /api/campaigns/process</code> periódicamente con una clave de la cuenta.</p></section>
    <section id="variables"><h2>Personalización e importación</h2><p>El mensaje admite <code>{'{nombre}'}</code>, <code>{'{numero}'}</code> y las claves de <code>variables</code> de cada destinatario. En el panel podés importar Excel o CSV. Las columnas adicionales se convierten en variables en minúsculas, reemplazando espacios por guiones bajos. También podés pegar líneas como <code>0981234567,María</code>.</p></section>
    <section id="estados"><h2>Estados y créditos</h2><p>Cada SMS cuesta 1 crédito: el texto debe tener hasta 160 caracteres (ver Reglas del mensaje). El saldo se reserva antes del envío y se devuelve si Winsap rechaza la solicitud. Los estados incluyen pendiente, simulado, aceptado y fallido.</p><p>La compra crea un link de Winsap para pagar con tarjeta o QR. Volver del checkout no acredita saldo: la plataforma verifica el pago, el monto y el link antes de acreditar.</p></section>
    <section id="errores"><h2>Errores</h2><p>Los errores devuelven JSON con un campo <code>error</code>. Códigos: 400 datos inválidos, 401 autenticación, 402 saldo insuficiente, 403 permisos, 404 recurso no encontrado y 422 número excluido, 429 límite de solicitudes (ver encabezado Retry-After) y 503 integración aún no activada.</p><Link href="/" className="docs-back"><ArrowLeft size={16}/> Volver al inicio</Link></section>
  </article></div>
</main> }
