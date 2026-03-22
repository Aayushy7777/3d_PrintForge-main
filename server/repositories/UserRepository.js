import prisma from '../lib/prisma.js';

export class UserRepository {
  static async createUser(data) {
    return prisma.user.create({
      data,
    });
  }

  static async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  static async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        deliveryAddresses: true,
      },
    });
  }

  static async updateUser(id, data) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  static async getAllUsers(skip = 0, take = 10) {
    return prisma.user.findMany({
      skip,
      take,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
  }

  static async getUserStats() {
    const totalUsers = await prisma.user.count();
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' },
    });
    const customerCount = await prisma.user.count({
      where: { role: 'CUSTOMER' },
    });

    return { totalUsers, adminCount, customerCount };
  }
}
