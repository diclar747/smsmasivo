#!/usr/bin/env bash
# Arranque en contenedor: genera los secretos desde variables de entorno, aplica migraciones y levanta el servidor.
set -euo pipefail
cd "$(dirname "$0")/.."

DATA_DIR="${DATA_DIR:-/data}"
PORT="${PORT:-3000}"
mkdir -p "$DATA_DIR"

# Variables que la app lee (ver .env.example). Sólo se escriben las que estén definidas.
: > dist/server/.dev.vars
for name in DEMO_ADMIN_PASSWORD DEMO_USER_PASSWORD WINSAP_SMS_KEY WINSAP_PAYMENTS_KEY SMS_LIVE PAYMENTS_LIVE PRICE_PER_CREDIT GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET CRON_SECRET; do
  value="${!name:-}"
  if [ -n "$value" ]; then printf '%s="%s"\n' "$name" "${value//\"/\\\"}" >> dist/server/.dev.vars; fi
done

export CLOUDFLARE_CF_FETCH_ENABLED=false WRANGLER_SEND_METRICS=false WRANGLER_WRITE_LOGS=false

echo "Aplicando migraciones…"
node node_modules/wrangler/bin/wrangler.js d1 migrations apply DB --local --persist-to "$DATA_DIR" --config deploy/wrangler.migrate.json

echo "Iniciando NexoSMS en el puerto $PORT"
exec node node_modules/wrangler/bin/wrangler.js dev --config dist/server/wrangler.json --local \
  --persist-to "$DATA_DIR" --ip 0.0.0.0 --port "$PORT" --inspector-port 0
