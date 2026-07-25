import { Request, Response } from "express";
import { prisma } from "../config/db";

export class IotController {
  async getDeviceLogs(req: Request, res: Response) {
    try {
      const deviceId = req.query.deviceId as string;

      if (!deviceId) {
        return res.status(400).json({ error: "Device ID required" });
      }

      const device = await prisma.device.findUnique({
        where: { id: deviceId }
      });

      if (!device) {
        return res.status(404).json({ error: "Device not found" });
      }

      const logs = await prisma.deviceLog.findMany({
        where: { deviceId },
        orderBy: { timestamp: "desc" },
        take: 20
      });

      return res.json({
        id: device.id,
        serialNumber: device.serialNumber,
        battery: device.battery,
        status: device.status,
        temperature: device.temperature,
        signal: device.signal,
        deviceLogs: logs
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to fetch device logs" });
    }
  }

  async triggerAction(req: Request, res: Response) {
    try {
      const { deviceId, action, code } = req.body;

      if (!deviceId || !action) {
        return res.status(400).json({ error: "Device ID and Action required" });
      }

      const device = await prisma.device.findUnique({
        where: { id: deviceId },
        include: { asset: true }
      });

      if (!device) {
        return res.status(404).json({ error: "Device not found" });
      }

      if (action === "UNLOCK") {
        if (!code) return res.status(400).json({ error: "Access passcode required" });
        
        // Find bookings associated with this device's asset that are active and paid
        const asset = device.asset;
        if (!asset) return res.status(400).json({ error: "No asset linked to this hardware node" });

        const activeBookings = await prisma.booking.findMany({
          where: {
            assetId: asset.id,
            bookingStatus: "ACTIVE",
            paymentStatus: "PAID",
            accessCode: code
          }
        });

        // For testing/mocking convenience, allow code '0000' as a master override
        if (activeBookings.length === 0 && code !== "0000") {
          await prisma.deviceLog.create({
            data: { deviceId, event: "ACCESS_DENIED_INVALID_PIN" }
          });
          return res.status(403).json({ error: "Keycode invalid or expired.", status: "LOCKED" });
        }

        await prisma.deviceLog.create({
          data: { deviceId, event: "UNLOCKED" }
        });

        await prisma.device.update({
          where: { id: deviceId },
          data: { status: "ONLINE" }
        });

        return res.json({ status: "UNLOCKED" });

      } else if (action === "LOCK") {
        await prisma.deviceLog.create({
          data: { deviceId, event: "LOCKED" }
        });

        return res.json({ status: "LOCKED" });

      } else if (action === "MOTION") {
        await prisma.deviceLog.create({
          data: { deviceId, event: "MOTION_ALERT_TRIGGERED" }
        });

        return res.json({ message: "Motion alert registered" });
      }

      return res.status(400).json({ error: "Action invalid" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "IoT Command transmission failed" });
    }
  }
}
