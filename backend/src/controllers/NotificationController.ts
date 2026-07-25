import { Request, Response } from "express";
import { NotificationRepository } from "../repositories/NotificationRepository";

const notifRepo = new NotificationRepository();

export class NotificationController {
  async getByUser(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string;
      const notifications = await notifRepo.findByUser(userId);
      return res.json(notifications);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to fetch notifications" });
    }
  }

  async markRead(req: Request, res: Response) {
    try {
      const { id } = req.body;
      const updated = await notifRepo.markAsRead(id);
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to update notification" });
    }
  }
}
