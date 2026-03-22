import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireAdmin } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

router.use(requireAdmin);

// GET /api/admin/stats
router.get('/stats', async (req, res, next) => {
  try {
    const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    const { data: revenueData } = await supabase.from('orders').select('total_amount').eq('payment_status', 'paid');
    const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: totalProducts } = await supabase.from('products').select('*', { count: 'exact', head: true });
    const { count: pendingOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: lowStockCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).lte('stock_quantity', 5);

    const totalRevenue = revenueData?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;

    res.json({
      total_orders: totalOrders,
      total_revenue: totalRevenue,
      total_users: totalUsers,
      total_products: totalProducts,
      pending_orders: pendingOrders,
      low_stock_count: lowStockCount
    });
  } catch (error) {
    next(error);
  }
});

// Product CRUD
router.get('/products', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('products').select('*, categories(*)').order('created_at', { ascending: false });
    if (error) return next(new AppError(error.message, 500));
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post('/products', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('products').insert(req.body).select().single();
    if (error) return next(new AppError(error.message, 400));
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

router.put('/products/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('products').update(req.body).eq('id', req.params.id).select().single();
    if (error) return next(new AppError(error.message, 400));
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.delete('/products/:id', async (req, res, next) => {
  try {
    const { error } = await supabase.from('products').delete().eq('id', req.params.id);
    if (error) return next(new AppError(error.message, 400));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Order Management
router.get('/orders', async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = supabase.from('orders').select('*, profiles(full_name)', { count: 'exact' });
    
    if (status) query = query.eq('status', status);
    
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, count, error } = await query;
    if (error) return next(new AppError(error.message, 500));
    
    res.json({ orders: data, total: count });
  } catch (error) {
    next(error);
  }
});

router.put('/orders/:id/status', async (req, res, next) => {
  try {
    const { status, tracking_number } = req.body;
    const updateData = { status, updated_at: new Date().toISOString() };
    
    if (tracking_number) updateData.tracking_number = tracking_number;
    if (status === 'shipped') updateData.shipped_at = new Date().toISOString();
    if (status === 'delivered') updateData.delivered_at = new Date().toISOString();

    const { data, error } = await supabase.from('orders').update(updateData).eq('id', req.params.id).select().single();
    if (error) return next(new AppError(error.message, 400));
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
