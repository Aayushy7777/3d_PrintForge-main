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
    const candidateUserIds = [...new Set([req.user.uid, req.user.auth_uid].filter(Boolean))];
    const primaryUserId = candidateUserIds[0];

    // Guard against stale/mismatched auth tokens that reference a missing users row
    const { data: existingUser, error: existingUserErr } = await supabase
      .from('users')
      .select('id')
      .eq('id', primaryUserId)
      .maybeSingle();

    if (existingUserErr) {
      return res.status(400).json({ error: existingUserErr.message });
    }

    if (!existingUser) {
      if (!req.user.email) {
        return res.status(401).json({
          error: 'User profile not found. Please login again to refresh your session.',
        });
      }

      const fallbackName = req.user.email.split('@')[0] || 'User';
      const { error: createUserErr } = await supabase.from('users').insert({
        id: primaryUserId,
        email: req.user.email,
        name: fallbackName,
      });

      if (createUserErr) {
        return res.status(400).json({
          error: `Unable to create user profile for order: ${createUserErr.message}`,
        });
      }
    }

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

    const tryInsert = async (userId, modernColumns = true) => {
      const baseInsert = {
        user_id: userId,
        items: normalizedItems,
        currency: 'INR',
        status: 'pending',
        delivery_address_id,
      };

      const payload = modernColumns
        ? {
            ...baseInsert,
            total_amount,
            payment_status: payment_method === 'online' ? 'unpaid' : 'cod',
          }
        : {
            ...baseInsert,
            total: total_amount,
            payment_method: payment_method || null,
          };

      return supabase.from('orders').insert(payload).select('id').single();
    };

    let result = null;
    let lastError = null;

    for (const candidateUserId of candidateUserIds) {
      result = await tryInsert(candidateUserId, true);

      if (result.error && /column .*total_amount|payment_status/i.test(result.error.message || '')) {
        result = await tryInsert(candidateUserId, false);
      }

      if (!result.error) break;
      lastError = result.error;
      if (!/orders_user_id_fkey/i.test(result.error.message || '')) break;
    }

    if (result?.error && lastError) {
      return res.status(400).json({ error: lastError.message });
    }

    const { data: order, error } = result;
    if (error) return res.status(400).json({ error: error.message });

    return res.status(201).json({ order: { id: order.id } });
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
  }
});

module.exports = router;

