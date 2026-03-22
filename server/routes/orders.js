import express from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../lib/supabase.js';
import { validateAddress, sanitizeAddress } from '../lib/addressValidation.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to extract user ID from JWT token
const verifyToken = (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Missing authorization' });

    const parts = auth.split(' ');
    if (parts.length !== 2) return res.status(401).json({ error: 'Invalid authorization format' });

    const token = parts[1];

    // Decode the token (JWT from Supabase auth contains the user id in 'id' claim)
    const decoded = jwt.decode(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    // Get userId from 'id' claim
    const userId = decoded.id;

    if (!userId) {
      return res.status(401).json({ error: 'Token missing user identifier' });
    }

    req.userId = userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// POST /api/orders/address - Save delivery address
router.post('/address', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const addressData = req.body;

    // Validate address data
    const validation = validateAddress(addressData);
    if (!validation.isValid) {
      return res.status(400).json({ error: 'Invalid address data', errors: validation.errors });
    }

    // Sanitize input to prevent injection attacks
    const sanitized = sanitizeAddress(addressData);
    sanitized.user_id = userId;

    // Insert address into delivery_addresses table
    const { data, error } = await supabase
      .from('delivery_addresses')
      .insert(sanitized)
      .select('id, user_id, full_name, phone_number, house_number, street, city, state, postal_code, country, delivery_instructions, created_at')
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({
      message: 'Address saved successfully',
      address_id: data.id,
      address: data,
    });
  } catch (err) {
    console.error('Address save error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/orders - create a new order
router.post('/', async (req, res) => {
  try {
    const { items, total, customer, delivery_address_id } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must have items' });
    }

    const insert = {
      items,
      total: total ?? null,
      customer: customer ?? null,
      delivery_address_id: delivery_address_id ?? null,
      status: 'pending',
    };

    const { data, error } = await supabase
      .from('orders')
      .insert(insert)
      .select('*')
      .single();

    if (error) return res.status(400).json({ error: error.message });

    res.status(201).json({
      ...data,
      total: typeof data.total === 'string' ? Number(data.total) : data.total,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Not found' });

    res.json({
      ...data,
      total: typeof data.total === 'string' ? Number(data.total) : data.total,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
