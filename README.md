# NexoSMS

Plataforma de SMS para Paraguay con landing, cuentas, contactos, campañas, reportes, saldo, administración y API.

## Desarrollo

1. Instalar dependencias con `npm ci`.
2. Configurar secretos en el entorno local o en `.dev.vars` (ignorado por Git). Usar `.env.example` como referencia. Nunca poner claves en el código cliente.
3. Generar migraciones con `npm run db:generate`. El despliegue de Sites aplica las migraciones al D1 configurado.
4. Ejecutar `npm run dev`. El enlace local se imprime en la consola.

Las cuentas demo se crean en el primer acceso a `/api/bootstrap` cuando se configuran `DEMO_ADMIN_PASSWORD` y `DEMO_USER_PASSWORD`. Correos: `admin@demo.sms.py` y `usuario@demo.sms.py`. La cuenta admin recibe 500 créditos demo y la de usuario 80. Los números de contacto de muestra son ficticios y no deben usarse para pruebas reales.

## Integraciones

- `WINSAP_SMS_KEY` se usa en el servidor con `POST https://winsap.com.py/api/rest/sms/send` y `GET /api/rest/sms/balance`.
- `WINSAP_PAYMENTS_KEY` se usa con `POST /api/v1/payment-links` y `GET /api/v1/payments`. Sólo se acreditan compras confirmadas, con monto y link coincidentes.
- `SMS_LIVE=false` mantiene los envíos en modo demo. `PAYMENTS_LIVE=false` impide crear pagos reales. Activar sólo después de validar configuración, precios y destinatarios.
- Google requiere `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`. Registrar `https://TU-DOMINIO/api/auth/google/callback` como redirect URI autorizado en Google Cloud.

La API propia se describe en `/docs`. Las claves generadas en el panel se almacenan sólo como hash y se muestran una vez.

## Campañas programadas

El panel procesa campañas vencidas mientras está abierto. Para ejecución desatendida, configurar `CRON_SECRET` y un programador externo que invoque `POST /api/internal/dispatch` con el encabezado `X-Cron-Secret`. Cada llamada procesa hasta cuatro campañas y hasta veinte destinatarios de cada una; repetir hasta completar. También existe `POST /api/campaigns/process` para una cuenta autenticada. Para producción de alto volumen se requiere un worker programado o cola durable que invoque este proceso de forma continua.

## Seguridad operativa

Las cookies de sesión son `HttpOnly`, `Secure` y `SameSite=Lax`; las contraseñas se derivan con PBKDF2. No se confirma la entrega final de SMS sólo por la aceptación de la API. Antes de abrir el sitio al público hay que incorporar límites de tasa, monitoreo, política de consentimiento de destinatarios y revisión de capacidad de envío.
