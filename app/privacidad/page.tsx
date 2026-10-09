import type { Metadata } from "next";
import { H, LegalPage, P } from "../legal";

export const metadata: Metadata = { title: "Política de Privacidad · NexoSMS" };

export default function Privacidad() {
  return (
    <LegalPage title="Política de Privacidad" updated="9 de octubre de 2026">
      <P>NexoSMS es una plataforma de envío de SMS para Paraguay. Esta política explica qué datos tratamos, para qué y cómo los protegemos.</P>
      <H>Datos que recopilamos</H>
      <P>Datos de cuenta (nombre, correo electrónico y, si inicias sesión con Google, tu identificador de Google y foto de perfil); contactos y números de teléfono que cargas; mensajes y campañas que envías; y registros de compras y saldo.</P>
      <H>Inicio de sesión con Google</H>
      <P>Solicitamos únicamente tu nombre, correo electrónico y foto de perfil para crear y autenticar tu cuenta. No accedemos a tus contactos de Google, correos, archivos ni ningún otro dato de tu cuenta de Google.</P>
      <H>Para qué usamos los datos</H>
      <P>Para prestar el servicio (autenticarte, enviar tus SMS, mostrarte reportes y saldo), procesar pagos, prevenir abuso y cumplir obligaciones legales. No vendemos tus datos ni los usamos para publicidad.</P>
      <H>Con quién los compartimos</H>
      <P>Con Winsap, nuestro proveedor de envío de SMS y de cobros, únicamente los datos necesarios para entregar los mensajes y confirmar pagos. No compartimos datos con otros terceros salvo obligación legal.</P>
      <H>Contactos de tus campañas</H>
      <P>Eres responsable de contar con el consentimiento de las personas a las que envías mensajes. Los números en tu lista de exclusión no reciben SMS.</P>
      <H>Seguridad y conservación</H>
      <P>Las contraseñas se almacenan con derivación PBKDF2, las claves de API solo como hash y las sesiones usan cookies seguras. Conservamos tus datos mientras tu cuenta esté activa; puedes eliminar contactos, campañas y reportes desde el panel.</P>
      <H>Tus derechos</H>
      <P>Puedes pedir acceso, corrección o eliminación de tus datos, o el cierre de tu cuenta, escribiéndonos al correo de contacto indicado en el sitio.</P>
      <H>Cambios</H>
      <P>Podemos actualizar esta política; publicaremos la nueva versión en esta página con su fecha.</P>
    </LegalPage>
  );
}
