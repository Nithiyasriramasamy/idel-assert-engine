"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceRepository = void 0;
const db_1 = require("../config/db");
class DeviceRepository {
    async findById(id) {
        return db_1.prisma.device.findUnique({
            where: { id },
            include: { deviceLogs: { orderBy: { timestamp: "desc" }, take: 20 } }
        });
    }
    async findBySerial(serialNumber) {
        return db_1.prisma.device.findUnique({
            where: { serialNumber }
        });
    }
    async create(data) {
        return db_1.prisma.device.create({ data });
    }
    async update(id, data) {
        return db_1.prisma.device.update({
            where: { id },
            data
        });
    }
    async logEvent(deviceId, event) {
        return db_1.prisma.deviceLog.create({
            data: {
                deviceId,
                event,
                timestamp: new Date()
            }
        });
    }
}
exports.DeviceRepository = DeviceRepository;
