import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { normalizeMaterial, MATERIAL_ERROR_MESSAGE } from '../utils/materials.js';

const router = express.Router();

// GET /api/orders
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) return next(new AppError(error.message, 500));
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/:id - single order for the current user
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (error) return next(new AppError(error.message, 500));
    if (!order) return next(new AppError('Order not found', 404));
    res.json(order);
  } catch (error) {
    next(error);
  }
});

// POST /api/orders - Create a new order
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { items, delivery_address_id, payment_method, coupon_code, notes } = req.body;

    if (!items || items.length === 0) {
      return next(new AppError('Order must have at least one item', 400));
    }

    // PLA-only gate (Task 1/2): validate every item's material up front.
    // Never trust the client — reject the whole order if any item asks for
    // a non-PLA material.
    const normalizedMaterials = [];
    for (const item of items) {
      const material = normalizeMaterial(item.material);
      if (!material) {
        return next(new AppError(MATERIAL_ERROR_MESSAGE, 400));
      }
      normalizedMaterials.push(material);
    }

    // 1. Fetch products to verify stock and price
    const productIds = items.map(item => item.product_id);
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    if (prodError) return next(new AppError(prodError.message, 500));

    // 2. Validate stock and calculate subtotal
    let subtotal = 0;
    const orderItemsToInsert = [];

    items.forEach((item, index) => {
      const product = products.find(p => p.id === item.product_id);
      if (!product) throw new AppError(`Product ${item.product_id} not found`, 404);
      if (product.stock_quantity < item.quantity) {
        throw new AppError(`Insufficient stock for ${product.name}`, 400);
      }

      const itemTotal = Number(product.price) * item.quantity;
      subtotal += itemTotal;

      orderItemsToInsert.push({
        product_id: product.id,
        product_name: product.name,
        product_image: product.thumbnail_url,
        sku: product.sku,
        quantity: item.quantity,
        unit_price: product.price,
        total_price: itemTotal,
        material: normalizedMaterials[index], // always PLA for now
      });
    });

    // 3. Validate address
    const { data: address, error: addrError } = await supabase
      .from('delivery_addresses')
      .select('*')
      .eq('id', delivery_address_id)
      .eq('user_id', req.user.id)
      .single();

    if (addrError || !address) return next(new AppError('Invalid delivery address', 400));

    // 4. Calculate final totals (tax, shipping, discount)
    let discount = 0;
    // Coupon logic would go here

    const shipping = subtotal >= 500 ? 0 : 49;
    const tax = (subtotal - discount) * 0.18; // 18% GST
    const total = subtotal - discount + shipping + tax;

    // 5. Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: req.user.id,
        status: 'pending',
        payment_status: 'pending',
        payment_method,
        subtotal,
        discount_amount: discount,
        shipping_amount: shipping,
        tax_amount: tax,
        total_amount: total,
        delivery_address_id: address.id,
        delivery_address: address, // JSONB snapshot
        notes,
      })
      .select()
      .single();

    if (orderError) return next(new AppError(orderError.message, 500));

    // 6. Create order items
    const finalItems = orderItemsToInsert.map(item => ({ ...item, order_id: order.id }));
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(finalItems);

    if (itemsError) return next(new AppError(itemsError.message, 500));

    // 7. Decrement stock (best-effort; use an RPC for atomicity in production)
    for (const item of items) {
      await supabase.rpc('decrement_stock', { p_id: item.product_id, qty: item.quantity });
    }

    // 8. Clear cart
    const { data: cart } = await supabase.from('carts').select('id').eq('user_id', req.user.id).single();
    if (cart) {
      await supabase.from('cart_items').delete().eq('cart_id', cart.id);
    }

    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
});

export default router;
