# Multi-stage Docker build for production-ready Express backend using Node 20
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY database/schema.prisma ./database/

# Install dependencies (utilizing root package.json for workspace optimization)
RUN npm install

# Copy configuration and src files
COPY backend/tsconfig.json ./backend/
COPY backend/src ./backend/src

# Generate Prisma Client and compile TypeScript
RUN npx prisma generate --schema=database/schema.prisma
RUN cd backend && npm run build

# Production Runner
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000
ENV DATABASE_URL="file:./database/dev.db"

# Copy node modules, compiled files, and database files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/backend/package*.json ./backend/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./backend/dist
COPY database ./database

EXPOSE 5000

# Run prisma db push to ensure database table migrations exist before starting the server
CMD ["sh", "-c", "npx prisma db push --schema=./database/schema.prisma && node backend/dist/server.js"]
