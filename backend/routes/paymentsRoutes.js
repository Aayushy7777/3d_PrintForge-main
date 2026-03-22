const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const supabase = require('../config/supabaseClient');
const auth = require('../middleware/supabaseAuthMiddleware');

const router = express.Router();
router.use(auth);

let rzp = null;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
} catch (e) {
  rzp = null;
}

router.post('/create-order', async (req, res) => {
  try {
    if (!rzp) return res.status(503).json({ error: 'Payment service unavailable. Missing Razorpay keys.' });
    const { order_id } = req.body || {};
    if (!order_id) return res.status(400).json({ error: 'order_id is required' });

    const candidateUserIds = [...new Set([req.user.uid, req.user.auth_uid].filter(Boolean))];

    const { data: order, error } = await supabase
      .from('orders')
      .select('id, user_id, total_amount, total, currency')
      .eq('id', order_id)
      .in('user_id', candidateUserIds)
      .single();

    if (error || !order) return res.status(404).json({ error: 'Order not found' });

    const total = Number(order.total_amount ?? order.total) || 0;
    const amountPaise = Math.round(total * 100);
    if (!amountPaise || amountPaise < 100) return res.status(400).json({ error: 'Invalid order amount' });

    const rzpOrder = await rzp.orders.create({
      amount: amountPaise,
      currency: order.currency || 'INR',
      receipt: `receipt_${order.id}`,
      notes: { app_order_id: order.id },
    });

    return res.json({ order: rzpOrder, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
  }
});

router.post('/create-link', async (req, res) => {
  try {
    if (!rzp) return res.status(503).json({ error: 'Payment service unavailable. Missing Razorpay keys.' });
    const { order_id } = req.body || {};
    if (!order_id) return res.status(400).json({ error: 'order_id is required' });

    const candidateUserIds = [...new Set([req.user.uid, req.user.auth_uid].filter(Boolean))];

    const { data: order, error } = await supabase
      .from('orders')
      .select('id, user_id, total_amount, total, currency')
      .eq('id', order_id)
      .in('user_id', candidateUserIds)
      .single();

    if (error || !order) return res.status(404).json({ error: 'Order not found' });

    const total = Number(order.total_amount ?? order.total) || 0;
    const amountPaise = Math.round(total * 100);
    if (!amountPaise || amountPaise < 100) return res.status(400).json({ error: 'Invalid order amount' });

    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5001';

    const paymentLink = await rzp.paymentLink.create({
      amount: amountPaise,
      currency: order.currency || 'INR',
      reference_id: order.id,
      description: `Payment for order ${order.id}`,
      callback_url: `${frontendBaseUrl}/order-confirmation?orderId=${order.id}`,
      callback_method: 'get',
      notes: {
        app_order_id: order.id,
        app_user_id: candidateUserIds[0],
      },
      ...(req.user.email
        ? {
            customer: {
              email: req.user.email,
            },
          }
        : {}),
    });

    return res.json({
      payment_link: paymentLink.short_url,
      payment_link_id: paymentLink.id,
    });
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
  }
});

router.post('/verify', async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) return res.status(503).json({ error: 'Payment service unavailable' });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
      return res.status(400).json({ error: 'Missing required payment fields' });
    }

    const generated = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated !== razorpay_signature) return res.status(400).json({ error: 'Payment verification failed' });

    const candidateUserIds = [...new Set([req.user.uid, req.user.auth_uid].filter(Boolean))];

    const tryUpdate = async (payload) =>
      supabase.from('orders').update(payload).eq('id', order_id).in('user_id', candidateUserIds);

    let result = await tryUpdate({
      payment_status: 'paid',
      status: 'confirmed',
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (result.error && /column .*payment_status|razorpay_/i.test(result.error.message || '')) {
      result = await tryUpdate({
        status: 'confirmed',
        payment_id: razorpay_payment_id,
      });
    }

    if (result.error) return res.status(400).json({ error: result.error.message });
    return res.json({ message: 'Payment verified successfully' });
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
  }
});

module.exports = router;

