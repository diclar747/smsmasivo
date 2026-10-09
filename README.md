# NexoSMS

Plataforma de SMS para Paraguay con landing, cuentas, contactos, campañas, reportes, saldo, administración y API.

## Desarrollo

1. Instalar dependencias con `npm ci`.
2. Configurar secretos en el entorno local o en `.dev.vars` (ignorado por Git). Usar `.env.example` como referencia. Nunca poner claves en el código cliente.
3. Generar migraciones con `npm run db:generate`. Las migraciones SQL viven en `drizzle/` y se aplican con `node deploy/migrate.mjs` (requiere `DATABASE_URL`).
4. Ejecutar `npm run dev`. El enlace local se imprime en la consola.

Las cuentas demo se crean en el primer acceso a `/api/bootstrap` cuando se configuran `DEMO_ADMIN_PASSWORD` y `DEMO_USER_PASSWORD`. Correos: `admin@demo.sms.py` y `usuario@demo.sms.py`. La cuenta admin recibe 500 créditos demo y la de usuario 80. Los números de contacto de muestra son ficticios y no deben usarse para pruebas reales.

## Integraciones

- `WINSAP_SMS_KEY` se usa en el servidor con `POST https://winsap.com.py/api/rest/sms/send` y `GET /api/rest/sms/balance`.
- `WINSAP_PAYMENTS_KEY` se usa con `POST /api/v1/payment-links` y `GET /api/v1/payments`. Winsap avisa a `POST /api/webhooks/winsap` (sólo se registra si el sitio corre en https) y el panel también consulta cada pocos segundos. En ambos casos el pago se confirma contra la API de Winsap antes de acreditar. Sólo se acreditan compras confirmadas, con monto y link coincidentes.
- `PRICE_PER_CREDIT` (por defecto 130 Gs) define el precio de cada SMS. La compra es libre desde 1.000 SMS: el usuario elige la cantidad y se cobra `cantidad × precio` (1 SMS = 1 crédito). El pago se verifica contra Winsap y se acredita solo.
- `SMS_LIVE=false` mantiene los envíos en modo demo. `PAYMENTS_LIVE=false` impide crear pagos reales. Activar sólo después de validar configuración, precios y destinatarios.
- Google requiere `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`. Registrar `https://TU-DOMINIO/api/auth/google/callback` como redirect URI autorizado en Google Cloud.

La API propia se describe en `/docs`. Las claves generadas en el panel se almacenan sólo como hash y se muestran una vez.

## Campañas programadas

El panel procesa campañas vencidas mientras está abierto. Para ejecución desatendida, configurar `CRON_SECRET` y un programador externo que invoque `POST /api/internal/dispatch` con el encabezado `X-Cron-Secret`. Cada llamada procesa hasta cuatro campañas y hasta veinte destinatarios de cada una; repetir hasta completar. También existe `POST /api/campaigns/process` para una cuenta autenticada. Para producción de alto volumen se requiere un worker programado o cola durable que invoque este proceso de forma continua.

## Seguridad operativa

Las cookies de sesión son `HttpOnly`, `Secure` y `SameSite=Lax`; las contraseñas se derivan con PBKDF2. No se confirma la entrega final de SMS sólo por la aceptación de la API. Antes de abrir el sitio al público hay que incorporar límites de tasa, monitoreo, política de consentimiento de destinatarios y revisión de capacidad de envío.

## Despliegue en Dokploy (Docker + PostgreSQL)

La app es un Worker (vinext) que en el contenedor corre con `wrangler dev --local` y guarda los datos en **PostgreSQL** (`DATABASE_URL`). Las migraciones de `drizzle/*.sql` se aplican solas al arrancar (`deploy/migrate.mjs`).

1. En Dokploy crear una base **PostgreSQL** y copiar su *Internal Connection URL* (`postgresql://usuario:clave@host-interno:5432/base`).
2. Crear la **Application**: provider Git, repositorio `https://github.com/diclar747/smsmasivo.git`, rama `main`, **Build Type: Dockerfile**.
3. **Environment**: `DATABASE_URL` (obligatoria), `DEMO_ADMIN_PASSWORD`, `DEMO_USER_PASSWORD`, `WINSAP_PAYMENTS_KEY`, `PAYMENTS_LIVE=true`, `WINSAP_SMS_KEY`, `SMS_LIVE`, `PRICE_PER_CREDIT=130`, `CRON_SECRET`. Opcional: `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`. `PORT` por defecto es 3000.
4. **Domains**: agregar el dominio, **Container Port 3000**, HTTPS activado. Las cookies de sesión son `Secure`.
5. No hace falta volumen: los datos viven en Postgres (hacer backups de esa base).
