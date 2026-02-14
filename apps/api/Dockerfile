FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate --schema=packages/db/prisma/schema.prisma
RUN cd apps/api && npx tsc

# Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./package.json
COPY --from=builder /app/packages/db ./packages/db
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 5001
CMD ["node", "dist/index.js"]
