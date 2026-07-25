"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const db_1 = require("../config/db");
class NotificationRepository {
    async findByUser(userId) {
        return db_1.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" }
        });
    }
    async create(data) {
        return db_1.prisma.notification.create({ data });
    }
    async markAsRead(id) {
        return db_1.prisma.notification.update({
            where: { id },
            data: { read: true }
        });
    }
}
exports.NotificationRepository = NotificationRepository;
