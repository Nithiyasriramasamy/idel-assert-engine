"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommenderAi = void 0;
const db_1 = require("../config/db");
class RecommenderAi {
    async getRecommendations(req, res) {
        try {
            const userId = req.query.userId;
            if (!userId) {
                const defaultRecs = await db_1.prisma.asset.findMany({
                    orderBy: { rating: "desc" },
                    include: { owner: true },
                    take: 6
                });
                return res.json(defaultRecs);
            }
            const pastBookings = await db_1.prisma.booking.findMany({
                where: { renterId: userId },
                include: { asset: true },
                take: 10
            });
            if (pastBookings.length === 0) {
                const trending = await db_1.prisma.asset.findMany({
                    orderBy: { rating: "desc" },
                    include: { owner: true },
                    take: 6
                });
                return res.json(trending);
            }
            const categoriesCount = {};
            pastBookings.forEach((b) => {
                const cat = b.asset.category;
                categoriesCount[cat] = (categoriesCount[cat] || 0) + 1;
            });
            let favoriteCategory = "";
            let maxCount = 0;
            Object.entries(categoriesCount).forEach(([cat, count]) => {
                if (count > maxCount) {
                    maxCount = count;
                    favoriteCategory = cat;
                }
            });
            const bookedAssetIds = pastBookings.map(b => b.assetId);
            let recommended = await db_1.prisma.asset.findMany({
                where: {
                    category: favoriteCategory,
                    id: { notIn: bookedAssetIds }
                },
                include: { owner: true },
                orderBy: { rating: "desc" },
                take: 6
            });
            if (recommended.length < 3) {
                const extra = await db_1.prisma.asset.findMany({
                    where: {
                        id: { notIn: [...bookedAssetIds, ...recommended.map(r => r.id)] }
                    },
                    include: { owner: true },
                    orderBy: { rating: "desc" },
                    take: 6 - recommended.length
                });
                recommended = [...recommended, ...extra];
            }
            return res.json(recommended);
        }
        catch (error) {
            return res.status(500).json({ error: error.message || "Failed to compile recommendations" });
        }
    }
}
exports.RecommenderAi = RecommenderAi;
