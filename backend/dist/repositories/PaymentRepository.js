"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRepository = void 0;
const db_1 = require("../config/db");
class PaymentRepository {
    async create(data) {
        return db_1.prisma.payment.create({ data });
    }
    async findByBooking(bookingId) {
        return db_1.prisma.payment.findMany({
            where: { bookingId }
        });
    }
}
exports.PaymentRepository = PaymentRepository;
