import { prisma } from "../config/db";

export class PaymentRepository {
  async create(data: any) {
    return prisma.payment.create({ data });
  }

  async findByBooking(bookingId: string) {
    return prisma.payment.findMany({
      where: { bookingId }
    });
  }
}
