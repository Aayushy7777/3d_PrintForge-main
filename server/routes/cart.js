import express from 'express';
import { supabase } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Fetch cart items
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (cartError) {
      console.error('Error fetching cart:', cartError);
      return res.status(500).json({ error: 'Failed to fetch cart' });
    }

    let cartId = cart?.id;
    if (!cartId) {
      // Create cart if not exists
      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert([{ user_id: userId, created_at: new Date() }])
        .select('id')
        .single();
      
      if (createError) {
        console.error('Error creating cart:', createError);
        return res.status(500).json({ error: 'Failed to create cart' });
      }
      cartId = newCart.id;
    }

    // Fetch items with product details
    // Note: joined query requires foreign key setup in Supabase
    const { data: items, error: itemsError } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        product:product_id (*)
      `)
      .eq('cart_id', cartId);

    if (itemsError) {
      console.error('Error fetching cart items:', itemsError);
      return res.status(500).json({ error: 'Failed to fetch cart items' });
    }

    const formattedItems = items.map(item => ({
      id: item.id,
      product_id: item.product.id,
      quantity: item.quantity,
      product: item.product
    }));

    res.json({ cart_items: formattedItems });

  } catch (err) {
    console.error('Cart GET error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add item to cart
router.post('/items', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) return res.status(400).json({ error: 'Product ID is required' });

    let { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!cart) {
      const { data: newCart, error } = await supabase
        .from('carts')
        .insert([{ user_id: userId }])
        .select('id')
        .single();
        
      if (error) throw error;
      cart = newCart;
    }

    // Check if item exists in cart
    const { data: existingItems } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cart.id)
      .eq('product_id', product_id);
    
    const existingItem = existingItems?.[0];

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('cart_items')
        .insert([{
          cart_id: cart.id,
          product_id: product_id,
          quantity: quantity
        }]);
      if (error) throw error;
    }

    res.json({ success: true });

  } catch (err) {
    console.error('Cart ADD error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Remove item
router.delete('/items/:itemId', requireAuth, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Cart DELETE error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update item quantity
router.put('/items/:itemId', requireAuth, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
       await supabase.from('cart_items').delete().eq('id', itemId);
    } else {
       await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Cart UPDATE error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
