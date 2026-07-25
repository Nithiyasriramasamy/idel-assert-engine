"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
exports.prisma.$connect()
    .then(() => console.log("Prisma Client connected to SQLite/PostgreSQL grid"))
    .catch((err) => console.error("Database connection failure:", err));
