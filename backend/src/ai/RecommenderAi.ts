import { Request, Response } from "express";
import { prisma } from "../config/db";

export class RecommenderAi {
  async getRecommendations(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string;

      if (!userId) {
        const defaultRecs = await prisma.asset.findMany({
          orderBy: { rating: "desc" },
          include: { owner: true },
          take: 6
        });
        return res.json(defaultRecs);
      }

      const pastBookings = await prisma.booking.findMany({
        where: { renterId: userId },
        include: { asset: true },
        take: 10
      });

      if (pastBookings.length === 0) {
        const trending = await prisma.asset.findMany({
          orderBy: { rating: "desc" },
          include: { owner: true },
          take: 6
        });
        return res.json(trending);
      }

      const categoriesCount: { [key: string]: number } = {};
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

      let recommended = await prisma.asset.findMany({
        where: {
          category: favoriteCategory,
          id: { notIn: bookedAssetIds }
        },
        include: { owner: true },
        orderBy: { rating: "desc" },
        take: 6
      });

      if (recommended.length < 3) {
        const extra = await prisma.asset.findMany({
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
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to compile recommendations" });
    }
  }
}
