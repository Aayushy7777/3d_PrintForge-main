import prisma from '../lib/prisma.js';

export class PaymentRepository {
  static async createPayment(data) {
    return prisma.payment.create({
      data,
    });
  }

  static async findById(id) {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            user: {
              select: { id: true, email: true, name: true },
            },
          },
        },
      },
    });
  }

  static async findByRazorpayId(razorpayPaymentId) {
    return prisma.payment.findUnique({
      where: { razorpayPaymentId },
      include: {
        order: {
          include: {
            user: {
              select: { id: true, email: true, name: true },
            },
          },
        },
      },
    });
  }

  static async findByOrderId(orderId) {
    return prisma.payment.findUnique({
      where: { orderId },
    });
  }

  static async updatePaymentStatus(id, status, razorpaySignature = null) {
    const updateData = { status };
    if (razorpaySignature) {
      updateData.razorpaySignature = razorpaySignature;
    }

    return prisma.payment.update({
      where: { id },
      data: updateData,
    });
  }

  static async getAllPayments(skip = 0, take = 10, filters = {}) {
    const where = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.method) {
      where.method = filters.method;
    }

    return prisma.payment.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: {
            orderNumber: true,
            user: {
              select: { email: true },
            },
          },
        },
      },
    });
  }

  static async getPaymentStats() {
    const totalPayments = await prisma.payment.count();
    const successfulPayments = await prisma.payment.count({
      where: { status: 'SUCCESS' },
    });
    const failedPayments = await prisma.payment.count({
      where: { status: 'FAILED' },
    });

    const totalAmount = await prisma.payment.aggregate({
      where: { status: 'SUCCESS' },
      _sum: { amount: true },
    });

    return {
      totalPayments,
      successfulPayments,
      failedPayments,
      totalAmount: totalAmount._sum.amount || 0,
    };
  }

  static async getPaymentsByDateRange(startDate, endDate) {
    return prisma.payment.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        status: 'SUCCESS',
      },
      include: {
        order: {
          select: {
            orderNumber: true,
          },
        },
      },
    });
  }

  static async refundPayment(id, refundAmount) {
    return prisma.payment.update({
      where: { id },
      data: {
        status: 'REFUNDED',
        refundAmount,
      },
    });
  }
}
