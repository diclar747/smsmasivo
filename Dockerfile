# NexoSMS — imagen para Dokploy / cualquier host con Docker.
# La app es un Worker (vinext + D1). Se ejecuta con wrangler en modo local; la base SQLite vive en /data (montar un volumen).
FROM node:22-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production \
    CI=1 \
    PORT=3000 \
    DATA_DIR=/data

COPY package.json package-lock.json .npmrc ./
RUN npm ci --include=dev

COPY . .
RUN npm run build && chmod +x deploy/start.sh

VOLUME ["/data"]
EXPOSE 3000
CMD ["deploy/start.sh"]
