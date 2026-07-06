import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { normalizeMaterial, MATERIAL_ERROR_MESSAGE } from '../utils/materials.js';

const router = express.Router();

// GET /api/cart
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('*, cart_items(*, products(*))')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (cartError) return next(new AppError(cartError.message, 500));

    // If no cart exists, create one
    if (!cart) {
      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert({ user_id: req.user.id })
        .select()
        .single();

      if (createError) return next(new AppError(createError.message, 500));
      return res.json({ ...newCart, cart_items: [] });
    }

    res.json(cart);
  } catch (error) {
    next(error);
  }
});

// POST /api/cart/items
router.post('/items', requireAuth, async (req, res, next) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return next(new AppError('product_id is required', 400));
    }

    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      return next(new AppError('quantity must be a positive integer', 400));
    }

    // PLA-only gate (Task 1/2): never trust the client's material value.
    const material = normalizeMaterial(req.body.material);
    if (!material) {
      return next(new AppError(MATERIAL_ERROR_MESSAGE, 400));
    }

    // Get or create cart
    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();

    let cartId = cart?.id;
    if (!cartId) {
      const { data: newCart } = await supabase
        .from('carts')
        .insert({ user_id: req.user.id })
        .select('id')
        .single();
      cartId = newCart.id;
    }

    // Upsert cart item (material is always the normalized value, i.e. PLA)
    const { data, error } = await supabase
      .from('cart_items')
      .upsert(
        { cart_id: cartId, product_id, quantity: parsedQuantity, material },
        { onConflict: 'cart_id,product_id' }
      )
      .select()
      .single();

    if (error) return next(new AppError(error.message, 400));
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

// PUT /api/cart/items/:id
router.put('/items/:id', requireAuth, async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (quantity < 1) {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', req.params.id);
      if (error) return next(new AppError(error.message, 400));
      return res.status(204).send();
    }

    const updatePayload = { quantity };

    // If the client tries to change material, apply the same PLA-only rule.
    if ('material' in req.body) {
      const material = normalizeMaterial(req.body.material);
      if (!material) {
        return next(new AppError(MATERIAL_ERROR_MESSAGE, 400));
      }
      updatePayload.material = material;
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update(updatePayload)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return next(new AppError(error.message, 400));
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/cart/items/:id
router.delete('/items/:id', requireAuth, async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', req.params.id);

    if (error) return next(new AppError(error.message, 400));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
