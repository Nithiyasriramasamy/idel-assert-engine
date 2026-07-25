"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const db_1 = require("../config/db");
class DashboardController {
    async getDashboardStats(req, res) {
        try {
            const { role, userId } = req.query;
            if (role === "OWNER") {
                // Fetch revenue aggregations for owner's assets
                const assets = await db_1.prisma.asset.findMany({
                    where: { ownerId: userId },
                    include: { bookings: true }
                });
                let totalRevenue = 0;
                let todayRevenue = 0;
                let totalAssets = assets.length;
                let rentedAssets = assets.filter(a => a.status === "RENTED").length;
                let occupancyRate = totalAssets > 0 ? Math.round((rentedAssets / totalAssets) * 100) : 0;
                assets.forEach(a => {
                    a.bookings.forEach(b => {
                        if (b.bookingStatus === "ACTIVE" || b.bookingStatus === "COMPLETED") {
                            totalRevenue += b.totalAmount;
                            // Mock check if created today
                            if (new Date(b.createdAt).toDateString() === new Date().toDateString()) {
                                todayRevenue += b.totalAmount;
                            }
                        }
                    });
                });
                const recentBookings = await db_1.prisma.booking.findMany({
                    where: { asset: { ownerId: userId } },
                    include: { renter: { select: { name: true, email: true } }, asset: { select: { title: true, category: true } } },
                    orderBy: { createdAt: "desc" },
                    take: 6
                });
                const recentNotifications = await db_1.prisma.notification.findMany({
                    where: { userId: userId },
                    orderBy: { createdAt: "desc" },
                    take: 5
                });
                return res.json({
                    totalRevenue,
                    todayRevenue,
                    totalAssets,
                    occupancyRate,
                    recentBookings,
                    recentNotifications
                });
            }
            else {
                // Renter Dashboards Overview
                const bookings = await db_1.prisma.booking.findMany({
                    where: { renterId: userId },
                    include: { asset: true }
                });
                let totalSpent = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
                return res.json({
                    totalSpent,
                    bookingsCount: bookings.length,
                    recentBookings: bookings.slice(0, 5)
                });
            }
        }
        catch (error) {
            return res.status(500).json({ error: error.message || "Failed to fetch dashboard metrics" });
        }
    }
    async getAnalytics(req, res) {
        try {
            const { category } = req.query;
            const filters = {};
            if (category && category !== "ALL")
                filters.category = category;
            const analytics = await db_1.prisma.analytics.findMany({
                where: filters,
                orderBy: { date: "asc" },
                take: 30
            });
            return res.json(analytics);
        }
        catch (error) {
            return res.status(500).json({ error: error.message || "Failed to fetch analytics metrics" });
        }
    }
}
exports.DashboardController = DashboardController;
