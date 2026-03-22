import express from 'express';
import { OrderRepository } from '../repositories/OrderRepository.js';
import { CartRepository } from '../repositories/CartRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { body, param, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Extract userId from header (JWT will be verified here in production)
const extractUserId = (req, res, next) => {
  req.userId = req.headers['x-user-id'] || req.user?.id;
  
  if (!req.userId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - User ID required',
    });
  }
  next();
};

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

// POST create order
router.post(
  '/',
  extractUserId,
  body('deliveryAddressId').notEmpty().isString(),
  body('shippingMethod').notEmpty().isString(),
  body('paymentMethod').notEmpty().isString(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const cartTotal = await CartRepository.getCartTotal(req.userId);

      if (cartTotal.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cart is empty',
        });
      }

      // Verify user exists
      const user = await UserRepository.findById(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Create order
      const order = await OrderRepository.createOrder({
        orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: req.userId,
        deliveryAddressId: req.body.deliveryAddressId,
        subtotal: cartTotal.subtotal,
        shippingCost: req.body.shippingCost || 0,
        tax: (cartTotal.subtotal * 0.18), // 18% GST
        totalAmount: cartTotal.subtotal + (req.body.shippingCost || 0) + (cartTotal.subtotal * 0.18),
        status: 'PENDING',
        shippingMethod: req.body.shippingMethod,
        paymentMethod: req.body.paymentMethod,
        items: {
          create: cartTotal.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            originalPrice: item.product.price,
            totalPrice: item.product.price * item.quantity,
          })),
        },
      });

      // Clear cart
      await CartRepository.clearCart(req.userId);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// GET user's orders
router.get('/', extractUserId, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await OrderRepository.getUserOrders(req.userId, skip, limit);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET single order
router.get(
  '/:orderId',
  extractUserId,
  param('orderId').isString(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const order = await OrderRepository.findById(req.params.orderId);

      if (!order || order.userId !== req.userId) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// GET all orders (admin only)
router.get('/admin/all', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.startDate || req.query.endDate) {
      filters.startDate = req.query.startDate;
      filters.endDate = req.query.endDate;
    }

    const orders = await OrderRepository.getAllOrders(skip, limit, filters);

    res.json({
      success: true,
      data: orders,
      pagination: { page, limit },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// PUT update order status (admin only)
router.put(
  '/:orderId/status',
  param('orderId').isString(),
  body('status').notEmpty().isString(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
      
      if (!validStatuses.includes(req.body.status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        });
      }

      const order = await OrderRepository.updateOrderStatus(
        req.params.orderId,
        req.body.status
      );

      res.json({
        success: true,
        message: 'Order status updated',
        data: order,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// GET order stats (admin only)
router.get('/admin/stats', async (req, res) => {
  try {
    const stats = await OrderRepository.getOrderStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
