import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';
import { CartRepository } from '../repositories/CartRepository.js';

const router = express.Router();

// GET /api/cart
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItems = await CartRepository.getCart(userId);
    // Format to match previous response shape: { cart_items: [{ id, product_id, quantity, product }] }
    const formatted = cartItems.map(item => ({
      id: item.id,
      product_id: item.productId,
      quantity: item.quantity,
      product: item.product,
    }));
    res.json({ cart_items: formatted });
  } catch (err) {
    console.error('Cart GET error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cart/items
router.post('/items', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity = 1, material = 'PLA', color = null, customNote = null } = req.body;
    if (!product_id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    await CartRepository.addToCart(userId, product_id, quantity, material, color, customNote);
    res.json({ success: true });
  } catch (err) {
    console.error('Cart ADD error:', err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/cart/items/:itemId
router.delete('/items/:itemId', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    // Ensure ownership
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      select: { id: true, userId: true },
    });
    if (!item || item.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await CartRepository.removeFromCart(itemId);
    res.json({ success: true });
  } catch (err) {
    console.error('Cart DELETE error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/cart/items/:itemId
router.put('/items/:itemId', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;
    if (quantity < 0) {
      return res.status(400).json({ error: 'Quantity must be non-negative' });
    }
    // Ensure ownership
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      select: { id: true, userId: true },
    });
    if (!item || item.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (quantity === 0) {
      await CartRepository.removeFromCart(itemId);
    } else {
      await CartRepository.updateCartItemQuantity(itemId, quantity);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Cart UPDATE error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
