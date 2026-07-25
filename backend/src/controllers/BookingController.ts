import { Request, Response } from "express";
import { BookingRepository } from "../repositories/BookingRepository";

const bookingRepo = new BookingRepository();

export class BookingController {
  async getByRenter(req: Request, res: Response) {
    try {
      const renterId = req.query.renterId as string;
      const bookings = await bookingRepo.findByRenter(renterId);
      return res.json(bookings);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to fetch bookings" });
    }
  }

  async create(req: Request, res: Response) {
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
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to create booking" });
    }
  }
}
