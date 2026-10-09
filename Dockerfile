# NexoSMS — imagen para Dokploy / cualquier host con Docker.
# La app es un Worker (vinext) que corre con wrangler en modo local y guarda los datos en PostgreSQL (DATABASE_URL).
FROM node:22-bookworm-slim

# workerd necesita certificados raíz para las llamadas HTTPS salientes (Google, Winsap).
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production \
    CI=1 \
    PORT=3000 \
    DATA_DIR=/data \
    SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt

COPY package.json package-lock.json .npmrc ./
RUN npm ci --include=dev

COPY . .
RUN npm run build && chmod +x deploy/start.sh

VOLUME ["/data"]
EXPOSE 3000
CMD ["deploy/start.sh"]
