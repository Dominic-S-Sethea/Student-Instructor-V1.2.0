# syntax=docker/dockerfile:1

FROM node:22-slim AS builder
WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY tsconfig.json tsconfig.server.json vite.config.ts index.html server.ts ./
COPY public ./public
COPY shared ./shared
COPY src ./src
COPY server ./server
COPY scripts/copy-db-assets.mjs ./scripts/copy-db-assets.mjs

RUN npm run build

FROM node:22-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    DATABASE_PATH=/data/cdes_platform.db

COPY package.json package-lock.json .npmrc ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

RUN mkdir -p /data /data/backups && chown -R node:node /app /data

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "dist/server/server.cjs"]
