const express = require('express');
const supabase = require('../config/supabaseClient');
const auth = require('../middleware/supabaseAuthMiddleware');

const router = express.Router();
router.use(auth);

// POST /api/orders
// Expected by frontend (Checkout.tsx): returns { order: { id } }
router.post('/', async (req, res) => {
  try {
    const { items, delivery_address_id, payment_method } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items are required' });
    }
    if (!delivery_address_id) {
      return res.status(400).json({ error: 'delivery_address_id is required' });
    }

    // Compute total from products table (server-side to avoid client tampering)
    const productIds = [...new Set(items.map((i) => i.product_id).filter(Boolean))];
    if (productIds.length === 0) return res.status(400).json({ error: 'items.product_id is required' });

    const { data: products, error: productsErr } = await supabase
      .from('products')
      .select('id, price')
      .in('id', productIds);

    if (productsErr) return res.status(400).json({ error: productsErr.message });
    const priceById = Object.fromEntries((products || []).map((p) => [p.id, Number(p.price) || 0]));

    const normalizedItems = items.map((i) => ({
      product_id: i.product_id,
      quantity: Number(i.quantity) || 1,
    }));

    const total_amount = normalizedItems.reduce((sum, i) => sum + (priceById[i.product_id] || 0) * i.quantity, 0);

    const baseInsert = {
      user_id: req.user.uid,
      items: normalizedItems,
      currency: 'INR',
      status: 'pending',
      delivery_address_id,
    };

    // Be tolerant to schema differences across Supabase setups
    const tryInsert = async (payload) => supabase.from('orders').insert(payload).select('id').single();

    let result = await tryInsert({
      ...baseInsert,
      total_amount,
      payment_status: payment_method === 'online' ? 'unpaid' : 'cod',
    });

    if (result.error && /column .*total_amount|payment_status/i.test(result.error.message || '')) {
      result = await tryInsert({
        ...baseInsert,
        total: total_amount,
        payment_method: payment_method || null,
      });
    }

    const { data: order, error } = result;
    if (error) return res.status(400).json({ error: error.message });

    return res.status(201).json({ order: { id: order.id } });
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
  }
});

module.exports = router;

