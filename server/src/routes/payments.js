import express from 'express';
import crypto from 'crypto';
import razorpay from 'razorpay';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

let rzp;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    rzp = new razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  } else {
    console.warn('⚠️ Razorpay credentials missing. Payment features will be disabled.');
  }
} catch (error) {
  console.error('❌ Failed to initialize Razorpay:', error.message);
}

// POST /api/payments/create-order
router.post('/create-order', requireAuth, async (req, res, next) => {
  try {
    if (!rzp) return next(new AppError('Payment service unavailable', 503));
    
    const { order_id } = req.body;

    const { data: order, error } = await supabase
      .from('orders')
      .select('total_amount, currency')
      .eq('id', order_id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !order) return next(new AppError('Order not found', 404));

    const options = {
      amount: Math.round(order.total_amount * 100),
      currency: order.currency || 'INR',
      receipt: `receipt_${order_id}`,
    };

    const rzpOrder = await rzp.orders.create(options);
    res.json({ order: rzpOrder, key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    next(error);
  }
});

// POST /api/payments/verify
router.post('/verify', requireAuth, async (req, res, next) => {
  try {
    if (!rzp) return next(new AppError('Payment service unavailable', 503));

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      const { error } = await supabase
        .from('orders')
        .update({ 
          payment_status: 'paid', 
          status: 'confirmed',
          payment_id: razorpay_payment_id
        })
        .eq('id', order_id);

      if (error) return next(new AppError(error.message, 500));

      res.json({ message: 'Payment verified successfully' });
    } else {
      return next(new AppError('Payment verification failed', 400));
    }
  } catch (error) {
    next(error);
  }
});

export default router;
