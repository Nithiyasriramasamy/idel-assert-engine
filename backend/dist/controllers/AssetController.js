"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetController = void 0;
const AssetRepository_1 = require("../repositories/AssetRepository");
const assetRepo = new AssetRepository_1.AssetRepository();
class AssetController {
    async getAll(req, res) {
        try {
            const { category, ownerId } = req.query;
            const filters = {};
            if (category && category !== "ALL")
                filters.category = category;
            if (ownerId)
                filters.ownerId = ownerId;
            const assets = await assetRepo.findAll(filters);
            return res.json(assets);
        }
        catch (error) {
            return res.status(500).json({ error: error.message || "Failed to fetch assets" });
        }
    }
    async getById(req, res) {
        try {
            const asset = await assetRepo.findById(req.params.id);
            if (!asset)
                return res.status(404).json({ error: "Asset not found" });
            return res.json(asset);
        }
        catch (error) {
            return res.status(500).json({ error: error.message || "Failed to fetch asset" });
        }
    }
    async create(req, res) {
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
        }
        catch (error) {
            return res.status(500).json({ error: error.message || "Failed to create asset" });
        }
    }
    async update(req, res) {
        try {
            const { status } = req.body;
            const updated = await assetRepo.update(req.body.id, { status });
            return res.json(updated);
        }
        catch (error) {
            return res.status(500).json({ error: error.message || "Failed to update asset" });
        }
    }
    async delete(req, res) {
        try {
            const id = req.query.id;
            await assetRepo.delete(id);
            return res.json({ message: "Asset deleted" });
        }
        catch (error) {
            return res.status(500).json({ error: error.message || "Failed to delete asset" });
        }
    }
}
exports.AssetController = AssetController;
