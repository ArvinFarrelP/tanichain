# syntax=docker/dockerfile:1

# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app

# ---- Dependencies (cached separately from source so code changes don't bust this layer) ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- Build ----
FROM base AS build
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- Production ----
FROM base AS production
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run as a non-root user for defense in depth. Next.js standalone output already
# expects to run unprivileged in most reference setups.
RUN addgroup -S tanichain && adduser -S tanichain -G tanichain

COPY --from=build --chown=tanichain:tanichain /app/public ./public
COPY --from=build --chown=tanichain:tanichain /app/.next/standalone ./
COPY --from=build --chown=tanichain:tanichain /app/.next/static ./.next/static

USER tanichain

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => process.exit(r.statusCode < 500 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "server.js"]
