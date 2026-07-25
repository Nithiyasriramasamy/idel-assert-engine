"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const NotificationRepository_1 = require("../repositories/NotificationRepository");
const notifRepo = new NotificationRepository_1.NotificationRepository();
class NotificationController {
    async getByUser(req, res) {
        try {
            const userId = req.query.userId;
            const notifications = await notifRepo.findByUser(userId);
            return res.json(notifications);
        }
        catch (error) {
            return res.status(500).json({ error: error.message || "Failed to fetch notifications" });
        }
    }
    async markRead(req, res) {
        try {
            const { id } = req.body;
            const updated = await notifRepo.markAsRead(id);
            return res.json(updated);
        }
        catch (error) {
            return res.status(500).json({ error: error.message || "Failed to update notification" });
        }
    }
}
exports.NotificationController = NotificationController;
