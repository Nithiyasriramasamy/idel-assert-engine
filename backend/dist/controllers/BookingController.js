"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingController = void 0;
const BookingRepository_1 = require("../repositories/BookingRepository");
const bookingRepo = new BookingRepository_1.BookingRepository();
class BookingController {
    async getByRenter(req, res) {
        try {
            const renterId = req.query.renterId;
            const bookings = await bookingRepo.findByRenter(renterId);
            return res.json(bookings);
        }
        catch (error) {
            return res.status(500).json({ error: error.message || "Failed to fetch bookings" });
        }
    }
    async create(req, res) {
        try {
            const { assetId, renterId, startTime, endTime, totalAmount, agreementText } = req.body;
            const accessCode = Math.floor(1000 + Math.random() * 9000).toString();
            const booking = await bookingRepo.create({
                assetId,
                renterId,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                totalAmount: parseFloat(totalAmount),
                agreement: agreementText,
                accessCode,
                bookingStatus: "PENDING",
                paymentStatus: "UNPAID"
            });
            return res.json(booking);
        }
        catch (error) {
            return res.status(500).json({ error: error.message || "Failed to create booking" });
        }
    }
}
exports.BookingController = BookingController;
