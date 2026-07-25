import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

prisma.$connect()
  .then(() => console.log("Prisma Client connected to SQLite/PostgreSQL grid"))
  .catch((err) => console.error("Database connection failure:", err));
