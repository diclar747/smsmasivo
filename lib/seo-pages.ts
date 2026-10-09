import { DEFAULT_PRICE, MIN_SMS } from "./site";

export type Section = { h2: string; p?: string[]; ul?: string[]; example?: string; exampleLabel?: string; code?: { lang: string; text: string }[] };
export type Faq = { q: string; a: string };
export type SeoPage = {
  slug: string; label: string; keyword: string; title: string; description: string; h1: string; lead: string;
  sections: Section[]; faq: Faq[]; related: string[];
};

const gs = (n: number) => `Gs. ${n.toLocaleString("es-PY").replace(/,/g, ".")}`;

export const CITIES = "Asunción, San Lorenzo, Luque, Capiatá, Lambaré, Fernando de la Mora, Ñemby, Limpio, Mariano Roque Alonso, Ciudad del Este, Encarnación, Pedro Juan Caballero, Coronel Oviedo, Caaguazú, Villarrica, Concepción, Pilar y Santa Rita";
export const DEPARTMENTS = "Central, Alto Paraná, Itapúa, Amambay, Canindeyú, Caaguazú, Guairá, Concepción y Ñeembucú";

const STEPS = ["Creás tu cuenta gratis en un minuto.", "Cargás créditos (1 SMS = 1 crédito) con tarjeta o QR.", "Importás tus contactos, escribís el mensaje y enviás o programás la campaña."];

export function seoPages(price: number = DEFAULT_PRICE): SeoPage[] {
  const minGs = price * MIN_SMS;
  return [
    {
      slug: "sms-masivo-paraguay", label: "SMS masivo Paraguay", keyword: "SMS masivo Paraguay",
      title: "SMS masivo Paraguay | Envío a Tigo, Claro, Personal y Vox",
      description: `Plataforma de SMS masivos en Paraguay: enviá campañas a todo el país desde la web o por API. ${gs(price)} por SMS, créditos que no vencen. Empezá gratis.`,
      h1: "SMS masivo en Paraguay, desde una sola plataforma",
      lead: "Enviá mensajes de texto a miles de clientes en todo el país en minutos: cargás tu lista, escribís el mensaje y NexoSMS se encarga del envío a Tigo, Claro, Personal y Vox.",
      sections: [
        { h2: "Qué es el envío de SMS masivos", p: ["El SMS masivo (o mensajería masiva) permite mandar un mismo mensaje de texto, o uno personalizado con el nombre de cada cliente, a una lista grande de números de celular. Llega directo al teléfono, sin necesidad de internet ni de instalar ninguna aplicación.", "Con NexoSMS podés enviar SMS online desde cualquier computadora, usando nuestro panel web, o integrarlo a tu sistema con la API."] },
        { h2: "Cómo enviar SMS masivos en Paraguay con NexoSMS", ul: STEPS },
        { h2: "Todo lo que incluye la plataforma", ul: ["Campañas de hasta 2.000 destinatarios, con envío inmediato o programado.", "Personalización con el nombre del cliente y otros datos de tu lista (Excel, CSV o pegando números).", "Reportes por fecha, estado y campaña, con exportación a CSV.", "Lista de exclusión: los números que no quieren recibir mensajes nunca reciben SMS.", "Saldo en créditos que no vencen y sin mensualidad.", "API REST para enviar desde tu aplicación, CRM o ERP."] },
        { h2: "SMS a todo Paraguay", p: [`Los SMS llegan a cualquier número móvil paraguayo, sin importar la operadora ni la ciudad: ${CITIES}, y todo el interior del país. Cubrimos los departamentos ${DEPARTMENTS}, entre otros.`] },
        { h2: "Ejemplo de mensaje masivo", example: "Hola {nombre}, esta semana 20% de descuento en toda la tienda. Mostrá este SMS en caja. Hasta el domingo.", exampleLabel: "Mensaje de ejemplo (1 crédito)" },
        { h2: "Un SMS = un crédito: sin sorpresas", p: ["Cada mensaje admite hasta 160 caracteres y consume exactamente 1 crédito. La plataforma verifica el largo antes de enviar y convierte los acentos (á, é, í, ó, ú) a letras simples para que el mensaje no pase a Unicode y cueste más. La ñ se mantiene."] },
      ],
      faq: [
        { q: "¿Cuánto cuesta enviar SMS masivos en Paraguay?", a: `El precio vigente es ${gs(price)} por SMS. La compra mínima es de ${MIN_SMS.toLocaleString("es-PY").replace(",", ".")} SMS (${gs(minGs)}) y los créditos no vencen.` },
        { q: "¿Puedo enviar SMS a todas las operadoras?", a: "Sí. Podés enviar a números de Tigo, Claro, Personal y Vox desde la misma lista; no hace falta separarlos." },
        { q: "¿Necesito instalar algo?", a: "No. Es una plataforma web: entrás desde el navegador, o integrás la API si preferís enviar desde tu propio sistema." },
        { q: "¿Se puede programar un envío para otro día?", a: "Sí. Podés programar la campaña con fecha y hora, y también pausarla, editarla o cancelarla antes de que termine." },
      ],
      related: ["sms-marketing", "precios-sms", "api-sms", "sms-empresarial"],
    },
    {
      slug: "sms-marketing", label: "SMS marketing", keyword: "SMS marketing Paraguay",
      title: "SMS marketing Paraguay | Campañas y promociones",
      description: "Marketing por SMS en Paraguay: campañas promocionales, ofertas y descuentos con mensajes personalizados y reportes. Creá tu cuenta y enviá hoy.",
      h1: "SMS marketing para vender más en Paraguay",
      lead: "El SMS llega a todos los celulares y se lee rápido. Usalo para promociones, lanzamientos y fidelización con campañas personalizadas y medibles.",
      sections: [
        { h2: "Por qué el SMS funciona en marketing móvil", p: ["Todos los teléfonos reciben SMS, no depende de datos móviles ni de que el cliente tenga una app. Por eso es un canal directo para comunicar ofertas, recordar una promoción por vencer o invitar a un evento."] },
        { h2: "Campañas SMS que podés hacer", ul: ["Promociones, descuentos y ofertas de temporada.", "Lanzamientos de productos o aperturas de sucursales.", "Fidelización: cumpleaños, puntos y beneficios para clientes frecuentes.", "Recuperación de clientes que hace tiempo no te compran.", "Invitaciones a eventos y convocatorias."] },
        { h2: "Personalizá cada mensaje", p: ["Usá {nombre} y los demás datos de tu lista para que cada cliente reciba un mensaje propio. Un mensaje con el nombre del cliente suele generar más respuesta que uno genérico."], example: "Hola {nombre}, tu cupón de 15% vence el viernes. Canjealo en cualquier sucursal con tu cédula.", exampleLabel: "Ejemplo de SMS promocional" },
        { h2: "Medí resultados", p: ["En reportes ves qué mensajes se enviaron, cuáles fallaron y cuántos créditos consumiste, filtrando por fecha o campaña. Podés exportarlo a CSV para analizarlo con tu equipo."] },
        { h2: "Buenas prácticas de SMS marketing", ul: ["Enviá solo a personas que aceptaron recibir tus mensajes.", "Identificá tu marca al inicio del mensaje.", "Mantené el texto corto, claro y con una sola llamada a la acción.", "Respetá la lista de exclusión: si alguien pide no recibir más, agregalo."] },
      ],
      faq: [
        { q: "¿Puedo hacer publicidad por SMS en Paraguay?", a: "Sí, siempre que cuentes con el consentimiento de los destinatarios y respetes quienes piden no recibir mensajes. NexoSMS incluye una lista de exclusión para eso." },
        { q: "¿Puedo incluir un enlace en el SMS?", a: "Sí, podés incluir un enlace a tu web o un enlace directo a WhatsApp, siempre dentro de los 160 caracteres del mensaje." },
        { q: "¿Cuánto cuesta una campaña?", a: "Cada SMS consume 1 crédito. Una campaña de 1.000 destinatarios consume 1.000 créditos." },
      ],
      related: ["sms-masivo-paraguay", "sms-whatsapp", "sms-premium", "precios-sms"],
    },
    {
      slug: "sms-premium", label: "SMS Premium", keyword: "SMS Premium Paraguay",
      title: "SMS Premium Paraguay | Mensajes de alto impacto",
      description: "SMS Premium en Paraguay: mensajes personalizados, programados y con enlace a WhatsApp para clientes importantes. Envío por panel web o API.",
      h1: "SMS Premium: mensajes de alto impacto para tus mejores clientes",
      lead: "Comunicaciones cuidadas, personalizadas y medibles para tus clientes más valiosos: ofertas exclusivas, atención VIP y avisos importantes.",
      sections: [
        { h2: "Qué entendemos por SMS Premium", p: ["En NexoSMS, “premium” significa un envío cuidado: segmentado, personalizado con el nombre del cliente, en el momento justo y con seguimiento de resultados. No se trata de números de tarifa especial ni de servicios con cobro al destinatario: el mensaje lo paga la empresa y el cliente lo recibe sin costo."] },
        { h2: "Ideal para", ul: ["Clientes VIP y ofertas exclusivas.", "Avisos importantes que no pueden pasar desapercibidos.", "Invitaciones a lanzamientos y eventos privados.", "Seguimiento postventa y encuestas de satisfacción."] },
        { h2: "Qué lo hace diferente", ul: ["Personalización con los datos de cada cliente.", "Programación a la hora ideal.", "Enlace directo a WhatsApp para continuar la conversación.", "Reportes con el estado de cada envío.", "Lista de exclusión para respetar a quien no quiere recibir mensajes."] },
        { h2: "Ejemplo de SMS Premium", example: "Sr/a {nombre}, como cliente destacado tenés acceso anticipado a nuestra nueva colección. Escribinos: wa.me/595994854167", exampleLabel: "Mensaje de ejemplo (1 crédito)" },
      ],
      faq: [
        { q: "¿El SMS Premium tiene un costo distinto?", a: `No. Todos los SMS cuestan lo mismo: ${gs(price)} cada uno, con hasta 160 caracteres.` },
        { q: "¿Es un número corto con cobro al cliente?", a: "No. Es un envío corporativo normal: la empresa paga el SMS, el destinatario no paga nada." },
      ],
      related: ["sms-empresarial", "sms-marketing", "sms-whatsapp", "precios-sms"],
    },
    {
      slug: "sms-empresarial", label: "SMS empresarial", keyword: "SMS empresarial Paraguay",
      title: "SMS empresarial y corporativo en Paraguay | NexoSMS",
      description: "SMS empresarial en Paraguay para comercios, instituciones y organizaciones: comunicación masiva, notificaciones y API. Sin mensualidad.",
      h1: "SMS empresarial y corporativo para tu organización",
      lead: "Mantené informados a clientes, socios y colaboradores con mensajería corporativa simple de usar, con reportes y sin contratos ni mensualidades.",
      sections: [
        { h2: "Mensajería de texto empresarial", p: ["NexoSMS es un servicio de SMS para empresas, comercios, instituciones y organizaciones que necesitan comunicarse con muchas personas a la vez, con control sobre qué se envía, cuándo y a quién."] },
        { h2: "Para qué sectores", ul: ["Comercios y tiendas: promociones y avisos de pedidos.", "Clínicas, farmacias y hospitales: recordatorios de citas y turnos.", "Colegios, escuelas y universidades: comunicados y convocatorias.", "Financieras, cooperativas y bancos: recordatorios de pago.", "Inmobiliarias, aseguradoras y empresas de servicios: avisos y atención al cliente.", "Hoteles, restaurantes, delivery y logística: confirmaciones y seguimiento.", "Municipalidades, instituciones públicas y asociaciones: campañas informativas."] },
        { h2: "Funciones corporativas", ul: ["Cuenta con panel web para todo tu equipo de trabajo.", "Campañas por lotes, programadas o inmediatas.", "API REST para integrar con tu CRM, ERP o sistema propio.", "Historial completo de envíos, exportable a CSV.", "Compra por créditos prepagos: controlás el gasto."] },
      ],
      faq: [
        { q: "¿Hay contrato o mensualidad?", a: "No. Cargás créditos cuando los necesitás y no vencen." },
        { q: "¿Sirve para pequeñas y grandes empresas?", a: "Sí. Podés empezar con la compra mínima y escalar a campañas de miles de mensajes o a una integración por API." },
      ],
      related: ["sms-masivo-paraguay", "api-sms", "sms-notificaciones", "sms-cobranza"],
    },
    {
      slug: "sms-tigo", label: "SMS Tigo", keyword: "SMS Tigo Paraguay",
      title: "SMS a Tigo Paraguay | Envío masivo de mensajes",
      description: "Enviá SMS masivos a clientes de Tigo en Paraguay desde NexoSMS: campañas, promociones y avisos desde la web o por API. Sin mensualidad.",
      h1: "SMS masivo a Tigo Paraguay",
      lead: "Si tu base de clientes tiene muchos usuarios de Tigo, podés enviarles mensajes masivos desde la misma plataforma que usás para el resto de las operadoras.",
      sections: [
        { h2: "Enviar SMS a números Tigo", p: ["Importá tu lista de contactos y NexoSMS reconoce cualquier número móvil paraguayo válido, sea Tigo o de otra operadora. No tenés que separar la lista ni hacer envíos distintos: una campaña llega a todos."] },
        { h2: "Usos frecuentes en clientes Tigo", ul: ["Promociones y ofertas para tu comercio.", "Avisos de pedidos, entregas y turnos.", "Recordatorios de pago y vencimientos.", "Invitaciones a eventos."] },
        { h2: "Ejemplo", example: "Hola {nombre}, tu pedido #{numero} salió a reparto y llega hoy. Gracias por elegirnos.", exampleLabel: "Aviso de pedido (1 crédito)" },
        { h2: "También funciona con", p: ["Claro, Personal y Vox: el mismo envío sirve para todas las operadoras."] },
      ],
      faq: [
        { q: "¿Puedo enviar SMS solo a clientes Tigo?", a: "Podés armar tu lista con los números que quieras. La plataforma envía a cualquier número móvil paraguayo, sin importar la operadora." },
        { q: "¿Se cobra distinto por operadora?", a: `No. Todos los SMS cuestan lo mismo: ${gs(price)} cada uno.` },
      ],
      related: ["sms-claro", "sms-personal", "sms-vox", "sms-masivo-paraguay"],
    },
    {
      slug: "sms-claro", label: "SMS Claro", keyword: "SMS Claro Paraguay",
      title: "SMS a Claro Paraguay | Envío masivo de mensajes",
      description: "Enviá SMS masivos a clientes de Claro en Paraguay con NexoSMS: recordatorios, cobranzas y campañas desde la web o por API. Créditos que no vencen.",
      h1: "SMS masivo a Claro Paraguay",
      lead: "Llegá a los clientes de Claro con recordatorios, avisos y campañas, usando la misma plataforma que para Tigo, Personal y Vox.",
      sections: [
        { h2: "Enviar SMS a números Claro", p: ["Cargá tu base de contactos y enviá. NexoSMS acepta todos los números móviles de Paraguay, incluidos los de Claro, y normaliza el formato por vos (por ejemplo 0991 123 456)."] },
        { h2: "Casos de uso", ul: ["Recordatorios de pago y vencimiento de cuotas.", "Confirmación de citas y reservas.", "Avisos de servicio al cliente.", "Notificaciones automáticas desde tu sistema con la API."] },
        { h2: "Ejemplo", example: "{nombre}, tu cuota vence el 15/10. Podés pagar por transferencia o en caja. Gracias.", exampleLabel: "Recordatorio de pago (1 crédito)" },
      ],
      faq: [
        { q: "¿Puedo mezclar números de Claro y de otras operadoras?", a: "Sí, en la misma campaña. La plataforma envía a todos sin que tengas que separarlos." },
        { q: "¿Qué pasa con los números portados?", a: "El envío se hace a cualquier número móvil paraguayo válido; la entrega final depende de la operadora del destinatario." },
      ],
      related: ["sms-tigo", "sms-personal", "sms-vox", "sms-cobranza"],
    },
    {
      slug: "sms-personal", label: "SMS Personal", keyword: "SMS Personal Paraguay",
      title: "SMS a Personal Paraguay | Envío masivo de mensajes",
      description: "Enviá SMS masivos a clientes de Personal en Paraguay con NexoSMS: convocatorias, avisos y promociones por panel web o API. Sin mensualidad.",
      h1: "SMS masivo a Personal Paraguay",
      lead: "Convocá, avisá y vendé: enviá SMS a los números de Personal junto con el resto de las operadoras, en una sola campaña.",
      sections: [
        { h2: "Enviar SMS a números Personal", p: ["Importá tu lista desde Excel o CSV, o pegá los números directamente. La plataforma valida cada número, elimina duplicados y te muestra cuántos créditos va a consumir la campaña antes de enviarla."] },
        { h2: "Casos de uso", ul: ["Convocatorias a reuniones, asambleas y eventos.", "Comunicados de colegios y asociaciones.", "Promociones y novedades de tu negocio.", "Campañas informativas."] },
        { h2: "Ejemplo", example: "{nombre}, te esperamos en la asamblea del sábado 18 a las 9:00 hs. Confirmá respondiendo por WhatsApp.", exampleLabel: "Convocatoria (1 crédito)" },
      ],
      faq: [
        { q: "¿Qué formatos de número acepta?", a: "Podés cargarlos como 0981 123 456, 981123456 o 595981123456; la plataforma los unifica." },
        { q: "¿Cómo evito enviar dos veces al mismo número?", a: "Al importar la lista se eliminan los duplicados automáticamente." },
      ],
      related: ["sms-tigo", "sms-claro", "sms-vox", "sms-notificaciones"],
    },
    {
      slug: "sms-vox", label: "SMS Vox", keyword: "SMS Vox Paraguay",
      title: "SMS a Vox Paraguay | Envío masivo de mensajes",
      description: "Enviá SMS masivos a clientes de Vox en Paraguay con NexoSMS: avisos, notificaciones y campañas desde la web o por API. Créditos que no vencen.",
      h1: "SMS masivo a Vox Paraguay",
      lead: "Incluí a los usuarios de Vox en tus campañas: la misma lista, el mismo envío y el mismo precio por mensaje que para las demás operadoras.",
      sections: [
        { h2: "Enviar SMS a números Vox", p: ["No hace falta una cuenta distinta por operadora. Con NexoSMS enviás a Vox, Tigo, Claro y Personal desde un único panel o con una sola llamada a la API."] },
        { h2: "Casos de uso", ul: ["Avisos institucionales y de servicios.", "Notificaciones automáticas de tu aplicación.", "Recordatorios y confirmaciones.", "Campañas informativas para organizaciones e instituciones."] },
        { h2: "Ejemplo", example: "Estimado/a {nombre}, le informamos que su trámite fue aprobado. Retírelo en ventanilla desde mañana.", exampleLabel: "Aviso institucional (1 crédito)" },
      ],
      faq: [
        { q: "¿Hay un costo diferente para Vox?", a: `No. Cada SMS cuesta ${gs(price)}, sea cual sea la operadora.` },
        { q: "¿Puedo hacer un envío de prueba?", a: "Sí. Podés enviar un SMS individual desde el panel o probar la API en línea desde la documentación." },
      ],
      related: ["sms-tigo", "sms-claro", "sms-personal", "api-sms"],
    },
    {
      slug: "api-sms", label: "API SMS", keyword: "API SMS Paraguay",
      title: "API SMS Paraguay | Gateway REST para enviar SMS",
      description: "API REST para enviar SMS en Paraguay: integrá tu sistema, CRM o ERP con ejemplos en PHP, Node.js, Python y cURL. Probala en línea con tu API Key.",
      h1: "API SMS para Paraguay: enviá mensajes desde tu sistema",
      lead: "Una API REST simple para enviar SMS, consultar saldo, ver el historial y gestionar campañas. Con documentación y consola de pruebas en línea.",
      sections: [
        { h2: "Gateway SMS para desarrolladores", p: ["Generás una API Key en tu panel y la enviás en el encabezado X-API-Key. Con eso podés enviar mensajes individuales, crear y ejecutar campañas, consultar el saldo y revisar el historial de envíos, todo en JSON."] },
        { h2: "Enviar un SMS con la API", code: [
          { lang: "cURL", text: `curl -X POST https://nexosms.cnid.com.py/api/messages \\\n  -H "X-API-Key: sms_TU_CLAVE" \\\n  -H "Content-Type: application/json" \\\n  -d '{"phone":"0981123456","message":"Hola, tu pedido está listo."}'` },
          { lang: "Node.js", text: `const res = await fetch("https://nexosms.cnid.com.py/api/messages", {\n  method: "POST",\n  headers: { "X-API-Key": process.env.SMS_KEY, "Content-Type": "application/json" },\n  body: JSON.stringify({ phone: "0981123456", message: "Hola, tu pedido está listo." }),\n});\nconsole.log(await res.json());` },
          { lang: "Python", text: `import requests\nr = requests.post("https://nexosms.cnid.com.py/api/messages",\n    headers={"X-API-Key": "sms_TU_CLAVE"},\n    json={"phone": "0981123456", "message": "Hola, tu pedido está listo."})\nprint(r.json())` },
          { lang: "PHP", text: `$ch = curl_init("https://nexosms.cnid.com.py/api/messages");\ncurl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true,\n  CURLOPT_HTTPHEADER => ["X-API-Key: sms_TU_CLAVE", "Content-Type: application/json"],\n  CURLOPT_POSTFIELDS => json_encode(["phone" => "0981123456", "message" => "Hola, tu pedido está listo."])]);\necho curl_exec($ch);` },
        ] },
        { h2: "Qué podés hacer con la API", ul: ["Enviar SMS individuales y por lotes (campañas).", "Consultar saldo y movimientos.", "Consultar el historial con filtros por fecha, estado y texto.", "Seguir una campaña en línea: enviados, fallidos y destinatarios.", "Gestionar la lista de números excluidos."] },
        { h2: "Integraciones", p: ["Funciona con cualquier lenguaje que haga peticiones HTTP: PHP, Node.js, Python, JavaScript, Java, .NET y más. Ideal para conectar tu CRM, ERP, tienda online o aplicación y automatizar los avisos."] },
        { h2: "Reglas del mensaje", p: ["Cada SMS admite hasta 160 caracteres y consume 1 crédito. Si el texto supera ese largo, la API responde con error y no descuenta saldo."] },
      ],
      faq: [
        { q: "¿Dónde pruebo la API?", a: "En la documentación hay una consola en línea: pegás tu API Key y probás enviar, consultar saldo, historial y campañas." },
        { q: "¿Tiene webhooks?", a: "Para el seguimiento de campañas podés consultar su estado por API. Escribinos si necesitás un caso de integración específico." },
        { q: "¿Cómo se autentica?", a: "Con una API Key en el encabezado X-API-Key. Las claves se generan y revocan desde el panel." },
      ],
      related: ["sms-otp", "sms-notificaciones", "sms-empresarial", "precios-sms"],
    },
    {
      slug: "sms-whatsapp", label: "SMS con enlace a WhatsApp", keyword: "SMS con enlace WhatsApp",
      title: "SMS con enlace a WhatsApp | Iniciá conversaciones",
      description: "Enviá SMS con un link directo a WhatsApp y convertí cada mensaje en una conversación con tu cliente. Campañas y envíos desde NexoSMS en Paraguay.",
      h1: "SMS con enlace a WhatsApp para iniciar conversaciones",
      lead: "Combiná el alcance del SMS con la comodidad de WhatsApp: tu cliente toca el enlace y te escribe con un mensaje ya preparado.",
      sections: [
        { h2: "Cómo funciona", ul: ["Enviás un SMS con un enlace del tipo wa.me/595XXXXXXXXX.", "El cliente toca el enlace y se abre WhatsApp con tu número.", "Podés dejar un texto inicial para que solo tenga que enviarlo."] },
        { h2: "En NexoSMS, en un clic", p: ["En el envío de SMS individual del panel podés agregar tu enlace de WhatsApp al mensaje con un solo botón. En campañas lo incluís en el texto como cualquier otro enlace."], example: "Hola {nombre}, ¿te ayudamos con tu pedido? Escribinos por WhatsApp: wa.me/595994854167", exampleLabel: "Ejemplo con enlace (1 crédito)" },
        { h2: "Cuándo usarlo", ul: ["Captar consultas de promociones y ofertas.", "Atención al cliente y soporte.", "Confirmación de pedidos y citas.", "Seguimiento de ventas."] },
        { h2: "Cuidá el largo", p: ["El enlace cuenta dentro de los 160 caracteres. Usá enlaces cortos para dejar espacio al mensaje."] },
      ],
      faq: [
        { q: "¿Puedo poner también un enlace a mi web?", a: "Sí, cualquier URL que entre dentro de los 160 caracteres del mensaje." },
        { q: "¿Necesito WhatsApp Business?", a: "No es obligatorio, pero se recomienda para atender a tus clientes desde una cuenta de empresa." },
      ],
      related: ["sms-marketing", "sms-premium", "sms-masivo-paraguay", "sms-notificaciones"],
    },
    {
      slug: "sms-cobranza", label: "SMS de cobranza", keyword: "SMS de cobranza Paraguay",
      title: "SMS de cobranza Paraguay | Recordatorios de pago",
      description: "SMS de cobranza en Paraguay: recordatorios de pago y avisos de vencimiento para financieras, cooperativas y empresas. Campañas y API.",
      h1: "SMS de cobranza y recordatorios de pago",
      lead: "Recordá vencimientos y cuotas pendientes de forma rápida y económica, con mensajes personalizados para cada deudor o cliente.",
      sections: [
        { h2: "Recuperá pagos con recordatorios a tiempo", p: ["Un aviso por SMS antes y después del vencimiento reduce la morosidad y mejora la recuperación de clientes. Es directo, económico y no depende de que el cliente use una aplicación."] },
        { h2: "Para quiénes", ul: ["Financieras y cooperativas.", "Bancos y empresas de crédito.", "Empresas de servicios y facturación recurrente.", "Colegios y universidades con cuotas.", "Inmobiliarias y alquileres."] },
        { h2: "Mensajes personalizados con la plataforma", p: ["Importás tu lista con nombre, monto y vencimiento y los incluís en el mensaje con variables."], example: "{nombre}, su cuota de {monto} vence el {fecha}. Evite recargos pagando antes. Consultas: 021 000 000.", exampleLabel: "Recordatorio con variables (1 crédito)" },
        { h2: "Automatizalo", p: ["Con la API tu sistema de gestión puede enviar los avisos solo, según la fecha de vencimiento de cada cuota."] },
      ],
      faq: [
        { q: "¿Puedo usar variables como monto y fecha?", a: "Sí. Además de {nombre} y {numero}, usás cualquier columna de tu lista (por ejemplo {monto} o {fecha}) para personalizar el mensaje." },
        { q: "¿Qué pasa si un cliente pide no recibir más mensajes?", a: "Lo agregás a la lista de exclusión y el sistema deja de enviarle SMS." },
      ],
      related: ["sms-notificaciones", "api-sms", "sms-empresarial", "sms-claro"],
    },
    {
      slug: "sms-notificaciones", label: "SMS notificaciones", keyword: "SMS de notificaciones",
      title: "SMS de notificaciones, avisos y recordatorios | NexoSMS",
      description: "SMS de notificaciones en Paraguay: confirmación de citas, turnos, pedidos y recordatorios automáticos para clínicas, colegios, delivery y más.",
      h1: "SMS de notificaciones, avisos y recordatorios",
      lead: "Mantené informados a tus clientes con avisos automáticos o programados: citas, turnos, pedidos, reservas y comunicados.",
      sections: [
        { h2: "Notificaciones por SMS que podés enviar", ul: ["Confirmación y recordatorio de citas y turnos médicos.", "Avisos de pedidos, envíos y delivery.", "Confirmación de reservas en hoteles y restaurantes.", "Comunicados de colegios, universidades y municipalidades.", "Alertas y avisos de servicio al cliente."] },
        { h2: "SMS programado y automático", p: ["Programá recordatorios para el día y la hora que quieras desde el panel, o automatizá el envío desde tu sistema con la API para que los avisos salgan cuando se produce el evento."] },
        { h2: "Ejemplo: recordatorio de cita", example: "Hola {nombre}, te recordamos tu cita mañana a las 9:30 en Clínica Salud. Para cambiarla escribinos por WhatsApp.", exampleLabel: "Recordatorio de cita (1 crédito)" },
        { h2: "Sectores", p: ["Clínicas, hospitales y farmacias; colegios y universidades; inmobiliarias; aseguradoras; hoteles y restaurantes; supermercados y tiendas; ecommerce, logística, transporte y delivery; municipalidades e instituciones públicas; eventos y asociaciones."] },
      ],
      faq: [
        { q: "¿Se pueden programar para otro día?", a: "Sí, al crear la campaña elegís fecha y hora de envío." },
        { q: "¿Puedo automatizar el envío desde mi sistema?", a: "Sí, con la API REST enviás cada aviso en el momento que ocurre el evento." },
      ],
      related: ["api-sms", "sms-cobranza", "sms-empresarial", "sms-otp"],
    },
    {
      slug: "sms-otp", label: "SMS de verificación (OTP)", keyword: "SMS de verificación OTP Paraguay",
      title: "SMS de verificación OTP por API | NexoSMS Paraguay",
      description: "Enviá códigos de verificación OTP por SMS en Paraguay con la API de NexoSMS: registro, acceso y recuperación de contraseña. Integración simple.",
      h1: "SMS de verificación y códigos OTP por API",
      lead: "Enviá códigos de un solo uso a tus usuarios para validar cuentas, confirmar registros o recuperar contraseñas, desde tu aplicación.",
      sections: [
        { h2: "Cómo enviar un código de verificación", p: ["Tu aplicación genera el código, lo guarda con un tiempo de vencimiento y lo envía con una sola llamada a la API. NexoSMS entrega el SMS; la verificación del código la hacés vos en tu sistema."], code: [{ lang: "cURL", text: `curl -X POST https://nexosms.cnid.com.py/api/messages \\\n  -H "X-API-Key: sms_TU_CLAVE" -H "Content-Type: application/json" \\\n  -d '{"phone":"0981123456","message":"Tu codigo de verificacion es 482915. Vence en 10 minutos."}'` }] },
        { h2: "Casos de uso", ul: ["Validar cuentas y confirmar registros.", "Recuperación de contraseña.", "Doble factor (2FA) en acceso a plataformas.", "Confirmación de operaciones."] },
        { h2: "Recomendaciones", ul: ["Usá códigos de 4 a 6 dígitos con vencimiento corto.", "Limitá los reenvíos por usuario para evitar abusos.", "Prevé un reenvío manual: la entrega final depende de la operadora y del teléfono del usuario.", "Mantené el mensaje corto: hasta 160 caracteres, 1 crédito."] },
      ],
      faq: [
        { q: "¿NexoSMS genera el código?", a: "No. Tu sistema genera y valida el código; NexoSMS se encarga de enviarlo por SMS." },
        { q: "¿Cuánto cuesta cada código?", a: `Cada SMS consume 1 crédito (${gs(price)}).` },
      ],
      related: ["api-sms", "sms-notificaciones", "precios-sms", "sms-empresarial"],
    },
    {
      slug: "precios-sms", label: "Precios SMS", keyword: "precio SMS Paraguay",
      title: `Precio SMS Paraguay | ${gs(price)} por SMS, sin mensualidad`,
      description: `Precio de SMS masivos en Paraguay: ${gs(price)} por mensaje, compra mínima de ${MIN_SMS.toLocaleString("es-PY").replace(",", ".")} SMS, créditos prepagos que no vencen. Pagá con tarjeta o QR.`,
      h1: `Precio de SMS en Paraguay: ${gs(price)} por mensaje`,
      lead: "Prepago, sin mensualidad ni contratos. Comprás los SMS que necesitás, los créditos no vencen y se acreditan solos apenas se confirma el pago.",
      sections: [
        { h2: "Tarifa", ul: [`${gs(price)} por SMS (1 SMS = 1 crédito), hasta 160 caracteres.`, `Compra mínima: ${MIN_SMS.toLocaleString("es-PY").replace(",", ".")} SMS (${gs(minGs)}).`, "Elegís libremente la cantidad: pagás cantidad × precio.", "Los créditos no vencen.", "Sin mensualidad, sin costo de alta y sin contrato."] },
        { h2: "Ejemplos de compra", ul: [`1.000 SMS = ${gs(price * 1000)}`, `5.000 SMS = ${gs(price * 5000)}`, `10.000 SMS = ${gs(price * 10000)}`, `50.000 SMS = ${gs(price * 50000)}`] },
        { h2: "Cómo se paga", p: ["Pagás con tarjeta o QR en un checkout seguro. Apenas se confirma el pago, el saldo se acredita automáticamente en tu cuenta; no tenés que avisar ni esperar una aprobación manual."] },
        { h2: "Qué consume un crédito", p: ["Un mensaje de hasta 160 caracteres consume exactamente 1 crédito. Si un envío es rechazado por el proveedor, el crédito vuelve a tu saldo. La plataforma impide enviar mensajes de más de 160 caracteres para que nunca se te cobre un segundo crédito sin querer."] },
        { h2: "Empresas y volúmenes grandes", p: ["Si necesitás cotizar un volumen alto o una integración especial, escribinos por WhatsApp y armamos una propuesta."] },
      ],
      faq: [
        { q: "¿Cuánto cuesta enviar un SMS en Paraguay?", a: `${gs(price)} por SMS en NexoSMS, sin importar la operadora (Tigo, Claro, Personal o Vox).` },
        { q: "¿Los créditos vencen?", a: "No. Los créditos no tienen fecha de vencimiento." },
        { q: "¿Hay mensualidad?", a: "No. Es un servicio prepago: pagás solo lo que enviás." },
        { q: "¿Cómo pago?", a: "Con tarjeta o QR. El saldo se acredita automáticamente al confirmarse el pago." },
      ],
      related: ["sms-masivo-paraguay", "sms-marketing", "api-sms", "sms-empresarial"],
    },
  ];
}

export const PAGE_SLUGS = seoPages().map(p => p.slug);
