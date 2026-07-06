import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireAdmin } from '../../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

const VALID_ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

router.use(requireAdmin);

async function fetchByIds(table, ids, columns = '*') {
  const uniqueIds = [...new Set((ids || []).filter(Boolean))];
  if (uniqueIds.length === 0) return [];

  const { data, error } = await supabase.from(table).select(columns).in('id', uniqueIds);
  if (error) throw new AppError(error.message, 500);
  return data || [];
}

async function enrichOrders(orders) {
  if (!orders?.length) return [];

  const orderIds = orders.map((order) => order.id);
  const [users, addresses, itemsResult] = await Promise.all([
    fetchByIds('users', orders.map((order) => order.user_id), 'id, email, name, phone'),
    fetchByIds('delivery_addresses', orders.map((order) => order.delivery_address_id), '*'),
    supabase.from('order_items').select('*').in('order_id', orderIds),
  ]);

  if (itemsResult.error) throw new AppError(itemsResult.error.message, 500);

  const usersById = new Map(users.map((user) => [user.id, user]));
  const addressesById = new Map(addresses.map((address) => [address.id, address]));
  const itemsByOrderId = new Map();

  for (const item of itemsResult.data || []) {
    const list = itemsByOrderId.get(item.order_id) || [];
    list.push({ ...item, material: item.material || 'PLA' });
    itemsByOrderId.set(item.order_id, list);
  }

  return orders.map((order) => ({
    ...order,
    user: usersById.get(order.user_id) || null,
    profiles: {
      full_name: usersById.get(order.user_id)?.name,
      email: usersById.get(order.user_id)?.email,
    },
    delivery_address: order.delivery_address || addressesById.get(order.delivery_address_id) || null,
    items: itemsByOrderId.get(order.id) || [],
  }));
}

// GET /api/admin/stats
router.get('/stats', async (req, res, next) => {
  try {
    const { count: totalOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });
    if (ordersError) return next(new AppError(ordersError.message, 500));

    const { data: revenueData, error: revenueError } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('payment_status', 'paid');
    if (revenueError) return next(new AppError(revenueError.message, 500));

    const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: totalProducts } = await supabase.from('products').select('*', { count: 'exact', head: true });
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    const { count: lowStockCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .lte('stock_quantity', 5);

    const totalRevenue = revenueData?.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0) || 0;

    res.json({
      total_orders: totalOrders || 0,
      total_revenue: totalRevenue,
      total_users: totalUsers || 0,
      total_products: totalProducts || 0,
      pending_orders: pendingOrders || 0,
      low_stock_count: lowStockCount || 0,
    });
  } catch (error) {
    next(error);
  }
});

// Product CRUD
router.get('/products', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(*)')
      .order('created_at', { ascending: false });
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
    const { data, error } = await supabase
      .from('products')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
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

// GET /api/admin/orders
router.get('/orders', async (req, res, next) => {
  try {
    const {
      status,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    let userIds = null;
    if (search) {
      const { data: matchingUsers, error: usersError } = await supabase
        .from('users')
        .select('id')
        .ilike('email', `%${search}%`);

      if (usersError) return next(new AppError(usersError.message, 500));
      userIds = (matchingUsers || []).map((user) => user.id);
      if (userIds.length === 0) {
        return res.json({ orders: [], total: 0, page: Number(page), limit: Number(limit) });
      }
    }

    let query = supabase.from('orders').select('*', { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);
    if (userIds) query = query.in('user_id', userIds);

    const parsedPage = Math.max(1, Number(page) || 1);
    const parsedLimit = Math.min(100, Math.max(1, Number(limit) || 20));
    const from = (parsedPage - 1) * parsedLimit;
    const to = from + parsedLimit - 1;

    const { data, count, error } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) return next(new AppError(error.message, 500));

    res.json({
      orders: await enrichOrders(data || []),
      total: count || 0,
      page: parsedPage,
      limit: parsedLimit,
    });
  } catch (error) {
    next(error);
  }
});

async function updateOrderStatus(req, res, next) {
  try {
    const status = String(req.body.status || '').toLowerCase();
    const trackingNumber = req.body.tracking_number;

    if (!VALID_ORDER_STATUSES.includes(status)) {
      return next(new AppError(`Invalid status. Use one of: ${VALID_ORDER_STATUSES.join(', ')}`, 400));
    }

    const updateData = { status, updated_at: new Date().toISOString() };
    if (trackingNumber) updateData.tracking_number = trackingNumber;
    if (status === 'shipped') updateData.shipped_at = new Date().toISOString();
    if (status === 'delivered') updateData.delivered_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return next(new AppError(error.message, 400));
    res.json(data);
  } catch (error) {
    next(error);
  }
}

router.patch('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/status', updateOrderStatus);

export default router;
