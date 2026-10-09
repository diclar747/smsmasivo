import type { Metadata } from "next";
import { H, LegalPage, P } from "../legal";

export const metadata: Metadata = { title: "Condiciones del Servicio · NexoSMS" };

export default function Terminos() {
  return (
    <LegalPage title="Condiciones del Servicio" updated="9 de octubre de 2026">
      <P>Al crear una cuenta o usar NexoSMS aceptas estas condiciones.</P>
      <H>El servicio</H>
      <P>NexoSMS permite enviar SMS a números de Paraguay, gestionar contactos y campañas, consultar reportes y comprar créditos (1 SMS = 1 crédito; mensajes largos pueden consumir más de uno).</P>
      <H>Tu cuenta</H>
      <P>Debes dar datos verdaderos y cuidar tu contraseña y claves de API. Eres responsable de la actividad realizada con tu cuenta.</P>
      <H>Uso aceptable</H>
      <P>Solo puedes enviar mensajes a personas que consintieron recibirlos. Está prohibido el spam, el fraude, el contenido ilegal, engañoso o abusivo, y suplantar a terceros. Debes respetar la lista de exclusión. Podemos suspender cuentas que incumplan estas reglas.</P>
      <H>Créditos y pagos</H>
      <P>Los créditos se compran por adelantado al precio vigente, mediante los medios de pago habilitados. Los créditos se acreditan cuando el pago es confirmado. Los créditos consumidos no son reembolsables; los SMS que fallen antes de ser aceptados por el proveedor se devuelven al saldo.</P>
      <H>Entrega</H>
      <P>La aceptación de un mensaje por el proveedor no garantiza su entrega final: depende de las operadoras y del dispositivo del destinatario.</P>
      <H>Disponibilidad y responsabilidad</H>
      <P>Prestamos el servicio tal como está, sin garantía de disponibilidad ininterrumpida. En la medida permitida por la ley, nuestra responsabilidad se limita al valor de los créditos no utilizados de tu cuenta.</P>
      <H>Cambios</H>
      <P>Podemos modificar estas condiciones; el uso continuado del servicio implica su aceptación.</P>
    </LegalPage>
  );
}
