const express = require('express');
const supabase = require('../config/supabaseClient');
const auth = require('../middleware/supabaseAuthMiddleware');

const router = express.Router();

router.use(auth);

async function getOrCreateCartId(userId) {
  const { data: existing, error: existingErr } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existingErr) throw new Error(existingErr.message);
  if (existing?.id) return existing.id;

  const { data: created, error: createErr } = await supabase
    .from('carts')
    .insert([{ user_id: userId }])
    .select('id')
    .single();

  if (createErr) throw new Error(createErr.message);
  return created.id;
}

// GET /api/cart
router.get('/', async (req, res) => {
  try {
    const cartId = await getOrCreateCartId(req.user.uid);

    const { data, error } = await supabase
      .from('cart_items')
      .select('id, product_id, quantity')
      .eq('cart_id', cartId)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    const rows = data || [];
    const productIds = [...new Set(rows.map((r) => r.product_id).filter(Boolean))];

    let productById = {};
    if (productIds.length > 0) {
      const { data: products, error: productsErr } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      if (productsErr) return res.status(400).json({ error: productsErr.message });
      productById = Object.fromEntries((products || []).map((p) => [p.id, p]));
    }

    const cart_items = rows.map((row) => ({
      id: row.id,
      product_id: row.product_id,
      quantity: row.quantity,
      product: productById[row.product_id],
    }));

    return res.json({ cart_items });
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
  }
});

// POST /api/cart/items
router.post('/items', async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body || {};
    if (!product_id) return res.status(400).json({ error: 'product_id is required' });

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 1) return res.status(400).json({ error: 'quantity must be >= 1' });

    const cartId = await getOrCreateCartId(req.user.uid);

    const { data: existing, error: fetchErr } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('product_id', product_id)
      .maybeSingle();

    if (fetchErr) return res.status(400).json({ error: fetchErr.message });

    if (existing?.id) {
      const { error: updateErr } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + qty })
        .eq('id', existing.id);

      if (updateErr) return res.status(400).json({ error: updateErr.message });
      return res.status(204).end();
    }

    const { error: insertErr } = await supabase
      .from('cart_items')
      .insert([{ cart_id: cartId, product_id, quantity: qty }]);

    if (insertErr) return res.status(400).json({ error: insertErr.message });
    return res.status(201).json({ message: 'Added to cart' });
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
  }
});

// PUT /api/cart/items/:id
router.put('/items/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const { quantity } = req.body || {};
    const qty = Number(quantity);
    if (!Number.isFinite(qty)) return res.status(400).json({ error: 'quantity is required' });

    const cartId = await getOrCreateCartId(req.user.uid);

    // Ensure item belongs to current user cart
    const { data: existing, error: fetchErr } = await supabase
      .from('cart_items')
      .select('id')
      .eq('id', itemId)
      .eq('cart_id', cartId)
      .maybeSingle();

    if (fetchErr) return res.status(400).json({ error: fetchErr.message });
    if (!existing) return res.status(404).json({ error: 'Cart item not found' });

    if (qty < 1) {
      const { error: delErr } = await supabase.from('cart_items').delete().eq('id', itemId);
      if (delErr) return res.status(400).json({ error: delErr.message });
      return res.status(204).end();
    }

    const { error: updateErr } = await supabase.from('cart_items').update({ quantity: qty }).eq('id', itemId);
    if (updateErr) return res.status(400).json({ error: updateErr.message });
    return res.status(204).end();
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
  }
});

// DELETE /api/cart/items/:id
router.delete('/items/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const cartId = await getOrCreateCartId(req.user.uid);

    const { data: existing, error: fetchErr } = await supabase
      .from('cart_items')
      .select('id')
      .eq('id', itemId)
      .eq('cart_id', cartId)
      .maybeSingle();

    if (fetchErr) return res.status(400).json({ error: fetchErr.message });
    if (!existing) return res.status(404).json({ error: 'Cart item not found' });

    const { error: delErr } = await supabase.from('cart_items').delete().eq('id', itemId);
    if (delErr) return res.status(400).json({ error: delErr.message });

    return res.status(204).end();
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
  }
});

module.exports = router;

