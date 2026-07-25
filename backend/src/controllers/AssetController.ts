import { Request, Response } from "express";
import { AssetRepository } from "../repositories/AssetRepository";

const assetRepo = new AssetRepository();

export class AssetController {
  async getAll(req: Request, res: Response) {
    try {
      const { category, ownerId } = req.query;
      const filters: any = {};
      if (category && category !== "ALL") filters.category = category;
      if (ownerId) filters.ownerId = ownerId;

      const assets = await assetRepo.findAll(filters);
      return res.json(assets);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to fetch assets" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const asset = await assetRepo.findById(req.params.id);
      if (!asset) return res.status(404).json({ error: "Asset not found" });
      return res.json(asset);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to fetch asset" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { ownerId, title, category, location, hourlyPrice, description, iotDeviceId } = req.body;
      const newAsset = await assetRepo.create({
        ownerId,
        title,
        category,
        location,
        hourlyPrice: parseFloat(hourlyPrice),
        dailyPrice: parseFloat(hourlyPrice) * 8,
        weeklyPrice: parseFloat(hourlyPrice) * 40,
        monthlyPrice: parseFloat(hourlyPrice) * 160,
        description,
        status: "AVAILABLE",
        latitude: 12.9716,
        longitude: 77.5946,
        deviceId: iotDeviceId || null
      });
      return res.json(newAsset);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to create asset" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { status } = req.body;
      const updated = await assetRepo.update(req.body.id, { status });
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to update asset" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = req.query.id as string;
      await assetRepo.delete(id);
      return res.json({ message: "Asset deleted" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to delete asset" });
    }
  }
}
