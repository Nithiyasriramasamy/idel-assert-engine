import { prisma } from "../config/db";

export class AssetRepository {
  async findAll(filters: any = {}) {
    return prisma.asset.findMany({
      where: filters,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        device: true,
        reviews: true
      }
    });
  }

  async findById(id: string) {
    return prisma.asset.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        device: true,
        reviews: true
      }
    });
  }

  async create(data: any) {
    return prisma.asset.create({ data });
  }

  async update(id: string, data: any) {
    return prisma.asset.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return prisma.asset.delete({
      where: { id }
    });
  }
}
