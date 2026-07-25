# Multi-stage Docker build for production-ready Next.js web application
# Stage 1: Install dependencies and copy schema files
FROM node:18-alpine AS base

# Install build tools if needed
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Stage 2: Install dependencies
FROM base AS dependencies
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm install --no-audit --no-fund
RUN npx prisma generate

# Stage 3: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
# Run schema migration and compilation
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:./prisma/dev.db"
RUN npx prisma generate
RUN npm run build

# Stage 4: Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create a non-root system user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy build artifacts and configuration
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Make sure SQLite directory is writable by nextjs user
RUN chown -R nextjs:nodejs /app/prisma

USER nextjs

EXPOSE 3000

# Perform migrations and start node server
CMD ["sh", "-c", "npx prisma db push && npm run start"]
