# DevOps Learning OS - production image
# Multi-stage build:
#   1. deps+build: install all deps, generate Prisma client, build client + server bundle
#   2. runtime: pruned production node_modules + dist artifacts, non-root user

# ---- Stage 1: build ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci && npx prisma generate

COPY . .
RUN npm run build

# Keep only production runtime dependencies (express, @prisma/client, etc.)
RUN npm prune --omit=dev && npx prisma generate

# ---- Stage 2: runtime ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# OpenSSL is required by the Prisma query engine on musl/alpine
RUN apk add --no-cache openssl curl

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json ./

RUN chown -R node:node /app
USER node

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=5 \
  CMD curl -fsS http://127.0.0.1:${PORT:-3000}/api/health > /dev/null || exit 1

CMD ["node", "dist/server.cjs"]
