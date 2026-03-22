import prisma from '../lib/prisma.js';

export class ProductRepository {
  static async createProduct(data) {
    return prisma.product.create({
      data,
      include: {
        category: true,
      },
    });
  }

  static async findById(id) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  static async findBySlug(slug) {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  static async getAllProducts(skip = 0, take = 10, filters = {}) {
    const where = {};

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.inStock !== undefined) {
      where.inStock = filters.inStock;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.product.findMany({
      where,
      skip,
      take,
      include: {
        category: true,
        _count: {
          select: { reviews: true },
        },
      },
    });
  }

  static async getFeaturedProducts() {
    return prisma.product.findMany({
      where: { isFeatured: true },
      take: 8,
      include: {
        category: true,
        _count: {
          select: { reviews: true },
        },
      },
    });
  }

  static async getProductsByCategory(categoryId, skip = 0, take = 10) {
    return prisma.product.findMany({
      where: { categoryId },
      skip,
      take,
      include: {
        category: true,
        _count: {
          select: { reviews: true },
        },
      },
    });
  }

  static async updateProduct(id, data) {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  static async deleteProduct(id) {
    return prisma.product.delete({
      where: { id },
    });
  }

  static async getProductStats() {
    const totalProducts = await prisma.product.count();
    const inStockCount = await prisma.product.count({
      where: { inStock: true },
    });
    const featuredCount = await prisma.product.count({
      where: { isFeatured: true },
    });

    return { totalProducts, inStockCount, featuredCount };
  }

  static async searchProducts(query, skip = 0, take = 10) {
    return prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { materials: { hasSome: [query] } },
        ],
      },
      skip,
      take,
      include: {
        category: true,
      },
    });
  }
}
