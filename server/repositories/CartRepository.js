import prisma from '../lib/prisma.js';

export class CartRepository {
  static async addToCart(userId, productId, quantity = 1, material = 'PLA', color = null, customNote = null) {
    // Validate material (only PLA allowed for now)
    if (material !== 'PLA') {
      throw new Error('Only PLA material is allowed');
    }
    const existing = await prisma.cartItem.findFirst({
      where: {
        userId,
        productId,
      },
    });

    if (existing) {
      return prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
        include: { product: true },
      });
    }

    return prisma.cartItem.create({
      data: {
        userId,
        productId,
        quantity,
        material,
        color,
        customNote,
      },
      include: { product: true },
    });
  }

  static async getCart(userId) {
    return prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async updateCartItemQuantity(id, quantity) {
    if (quantity <= 0) {
      return this.removeFromCart(id);
    }

    return prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: { product: true },
    });
  }

  static async removeFromCart(id) {
    return prisma.cartItem.delete({
      where: { id },
    });
  }

  static async removeItemByProductId(userId, productId) {
    return prisma.cartItem.deleteMany({
      where: {
        userId,
        productId,
      },
    });
  }

  static async clearCart(userId) {
    return prisma.cartItem.deleteMany({
      where: { userId },
    });
  }

  static async getCartTotal(userId) {
    const items = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true,
      },
    });

    const subtotal = items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    return {
      items,
      itemCount: items.length,
      subtotal,
    };
  }

  static async getCartItemCount(userId) {
    return prisma.cartItem.count({
      where: { userId },
    });
  }
}
