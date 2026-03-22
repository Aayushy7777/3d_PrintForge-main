import prisma from '../lib/prisma.js';

export class OrderRepository {
  static async createOrder(data) {
    return prisma.order.create({
      data,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
        deliveryAddress: true,
      },
    });
  }

  static async findById(id) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
        deliveryAddress: true,
      },
    });
  }

  static async findByOrderNumber(orderNumber) {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
        deliveryAddress: true,
      },
    });
  }

  static async getUserOrders(userId, skip = 0, take = 10) {
    return prisma.order.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, image: true },
            },
          },
        },
        payment: {
          select: { status: true, amount: true },
        },
      },
    });
  }

  static async getAllOrders(skip = 0, take = 10, filters = {}) {
    const where = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    return prisma.order.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true },
        },
        payment: {
          select: { status: true, amount: true },
        },
      },
    });
  }

  static async updateOrderStatus(id, status) {
    return prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  static async getOrderStats() {
    const totalOrders = await prisma.order.count();
    const pendingOrders = await prisma.order.count({
      where: { status: 'PENDING' },
    });
    const shippedOrders = await prisma.order.count({
      where: { status: 'SHIPPED' },
    });
    const deliveredOrders = await prisma.order.count({
      where: { status: 'DELIVERED' },
    });

    const totalRevenue = await prisma.order.aggregate({
      where: { status: 'DELIVERED' },
      _sum: { totalAmount: true },
    });

    return {
      totalOrders,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
    };
  }

  static async getRecentOrders(limit = 5) {
    return prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true },
        },
        payment: {
          select: { status: true, amount: true },
        },
      },
    });
  }
}
