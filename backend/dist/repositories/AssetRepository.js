"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetRepository = void 0;
const db_1 = require("../config/db");
class AssetRepository {
    async findAll(filters = {}) {
        return db_1.prisma.asset.findMany({
            where: filters,
            include: {
                owner: { select: { id: true, name: true, email: true } },
                device: true,
                reviews: true
            }
        });
    }
    async findById(id) {
        return db_1.prisma.asset.findUnique({
            where: { id },
            include: {
                owner: { select: { id: true, name: true, email: true } },
                device: true,
                reviews: true
            }
        });
    }
    async create(data) {
        return db_1.prisma.asset.create({ data });
    }
    async update(id, data) {
        return db_1.prisma.asset.update({
            where: { id },
            data
        });
    }
    async delete(id) {
        return db_1.prisma.asset.delete({
            where: { id }
        });
    }
}
exports.AssetRepository = AssetRepository;
