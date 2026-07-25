import { prisma } from "../config/db";

export class NotificationRepository {
  async findByUser(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
  }

  async create(data: any) {
    return prisma.notification.create({ data });
  }

  async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { read: true }
    });
  }
}
