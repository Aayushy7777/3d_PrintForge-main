import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// GET /api/reviews/product/:productId
router.get('/product/:productId', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles(full_name, avatar_url)')
      .eq('product_id', req.params.productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) return next(new AppError(error.message, 500));
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// POST /api/reviews
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { product_id, order_id, rating, title, body } = req.body;

    // Verify user has purchased the product
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id')
      .eq('id', order_id)
      .eq('user_id', req.user.id)
      .single();

    if (orderError || !order) {
      return next(new AppError('You can only review products you have purchased', 403));
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id,
        user_id: req.user.id,
        order_id,
        rating,
        title,
        body,
        is_verified_purchase: true
      })
      .select()
      .single();

    if (error) return next(new AppError(error.message, 400));
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
