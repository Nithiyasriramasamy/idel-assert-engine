"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const BookingRepository_1 = require("../repositories/BookingRepository");
const PaymentRepository_1 = require("../repositories/PaymentRepository");
const AssetRepository_1 = require("../repositories/AssetRepository");
const db_1 = require("../config/db");
const bookingRepo = new BookingRepository_1.BookingRepository();
const paymentRepo = new PaymentRepository_1.PaymentRepository();
const assetRepo = new AssetRepository_1.AssetRepository();
class PaymentController {
    async processPayment(req, res) {
        try {
            const { bookingId, amount, method, signatureName } = req.body;
            const booking = await bookingRepo.findById(bookingId);
            if (!booking)
                return res.status(404).json({ error: "Booking reference invalid" });
            const transactionId = "TXN-" + Math.floor(10000000 + Math.random() * 90000000).toString();
            // Write payment transaction
            await paymentRepo.create({
                bookingId,
                amount: parseFloat(amount),
                method,
                status: "SUCCESS",
                transactionId
            });
            // Write agreement
            await db_1.prisma.agreement.create({
                data: {
                    bookingId,
                    content: booking.agreement || "Leasing terms signature.",
                    signature: signatureName
                }
            });
            // Update statuses
            const accessCode = Math.floor(1000 + Math.random() * 9000).toString();
            await bookingRepo.update(bookingId, {
                bookingStatus: "ACTIVE",
                paymentStatus: "PAID",
                accessCode
            });
            await assetRepo.update(booking.assetId, {
                status: "RENTED"
            });
            return res.json({
                success: true,
                transactionId,
                accessCode
            });
        }
        catch (error) {
            return res.status(500).json({ error: error.message || "Payment transaction failed" });
        }
    }
}
exports.PaymentController = PaymentController;
