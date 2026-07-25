import { prisma } from "../config/db";

export class DeviceRepository {
  async findById(id: string) {
    return prisma.device.findUnique({
      where: { id },
      include: { deviceLogs: { orderBy: { timestamp: "desc" }, take: 20 } }
    });
  }

  async findBySerial(serialNumber: string) {
    return prisma.device.findUnique({
      where: { serialNumber }
    });
  }

  async create(data: any) {
    return prisma.device.create({ data });
  }

  async update(id: string, data: any) {
    return prisma.device.update({
      where: { id },
      data
    });
  }

  async logEvent(deviceId: string, event: string) {
    return prisma.deviceLog.create({
      data: {
        deviceId,
        event,
        timestamp: new Date()
      }
    });
  }
}
