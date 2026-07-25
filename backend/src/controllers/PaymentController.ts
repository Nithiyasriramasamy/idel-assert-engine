import { Request, Response } from "express";
import { BookingRepository } from "../repositories/BookingRepository";
import { PaymentRepository } from "../repositories/PaymentRepository";
import { AssetRepository } from "../repositories/AssetRepository";
import { prisma } from "../config/db";

const bookingRepo = new BookingRepository();
const paymentRepo = new PaymentRepository();
const assetRepo = new AssetRepository();

export class PaymentController {
  async processPayment(req: Request, res: Response) {
    try {
      const { bookingId, amount, method, signatureName } = req.body;

      const booking = await bookingRepo.findById(bookingId);
      if (!booking) return res.status(404).json({ error: "Booking reference invalid" });

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
      await prisma.agreement.create({
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
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Payment transaction failed" });
    }
  }
}
