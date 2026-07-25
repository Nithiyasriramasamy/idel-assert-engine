"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingRepository = void 0;
const db_1 = require("../config/db");
class BookingRepository {
    async findById(id) {
        return db_1.prisma.booking.findUnique({
            where: { id },
            include: { asset: true, renter: true }
        });
    }
    async findByRenter(renterId) {
        return db_1.prisma.booking.findMany({
            where: { renterId },
            include: { asset: true },
            orderBy: { createdAt: "desc" }
        });
    }
    async findByOwner(ownerId) {
        return db_1.prisma.booking.findMany({
            where: { asset: { ownerId } },
            include: { asset: true, renter: true },
            orderBy: { createdAt: "desc" }
        });
    }
    async create(data) {
        return db_1.prisma.booking.create({ data });
    }
    async update(id, data) {
        return db_1.prisma.booking.update({
            where: { id },
            data
        });
    }
}
exports.BookingRepository = BookingRepository;
