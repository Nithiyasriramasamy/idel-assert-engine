import { prisma } from "../config/db";

export class BookingRepository {
  async findById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
      include: { asset: true, renter: true }
    });
  }

  async findByRenter(renterId: string) {
    return prisma.booking.findMany({
      where: { renterId },
      include: { asset: true },
      orderBy: { createdAt: "desc" }
    });
  }

  async findByOwner(ownerId: string) {
    return prisma.booking.findMany({
      where: { asset: { ownerId } },
      include: { asset: true, renter: true },
      orderBy: { createdAt: "desc" }
    });
  }

  async create(data: any) {
    return prisma.booking.create({ data });
  }

  async update(id: string, data: any) {
    return prisma.booking.update({
      where: { id },
      data
    });
  }
}
