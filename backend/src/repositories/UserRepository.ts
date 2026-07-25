import { prisma } from "../config/db";

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id }
    });
  }

  async createUser(data: any) {
    return prisma.user.create({ data });
  }
}
