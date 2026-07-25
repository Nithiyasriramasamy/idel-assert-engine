# Multi-stage Docker build for production-ready Express backend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY backend/package*.json ./backend/
COPY database/schema.prisma ./database/

# Install dependencies inside backend/
RUN cd backend && npm install

# Copy configuration and src files
COPY backend/tsconfig.json ./backend/
COPY backend/src ./backend/src

# Generate Prisma Client and compile typescript code
RUN cd backend && npx prisma generate --schema=../database/schema.prisma && npm run build

# Production Runner
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy node modules, compiled files, and database files
COPY --from=builder /app/backend/package*.json ./backend/
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/dist ./backend/dist
COPY database ./database

EXPOSE 5000

# Run prisma db push to ensure database table migrations exist before starting the server
CMD ["sh", "-c", "npx prisma db push --schema=./database/schema.prisma && node backend/dist/server.js"]
