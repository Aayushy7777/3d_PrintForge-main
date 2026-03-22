import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

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

// POST /api/orders - Create a new order
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { items, delivery_address_id, payment_method, coupon_code, notes } = req.body;

    if (!items || items.length === 0) {
      return next(new AppError('Order must have at least one item', 400));
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

    for (const item of items) {
      const product = products.find(p => p.id === item.product_id);
      if (!product) return next(new AppError(`Product ${item.product_id} not found`, 404));
      if (product.stock_quantity < item.quantity) {
        return next(new AppError(`Insufficient stock for ${product.name}`, 400));
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
        total_price: itemTotal
      });
    }

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
    const tax = (subtotal - discount) * 0.18;
    const total = subtotal - discount + shipping + tax;

    // 5. Create order in a "transaction" simulation
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
        delivery_address: address, // JSONB
        notes
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

    // 7. Decrement stock (RPC suggested in brief, but we can do simple update for now)
    // In production, use RPC to ensure atomicity
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
