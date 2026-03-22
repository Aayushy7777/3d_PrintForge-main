import express from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../lib/supabase.js';
import { validateAddress, sanitizeAddress } from '../lib/addressValidation.js';

const router = express.Router();

// Middleware to extract user ID from JWT token
const verifyToken = (req, res, next) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return res.status(500).json({ error: 'Server misconfigured: missing JWT_SECRET' });
    }

    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Missing authorization' });

    const parts = auth.split(' ');
    if (parts.length !== 2) return res.status(401).json({ error: 'Invalid authorization format' });

    const token = parts[1];

    // Verify signature and extract user id from our issued token
    const decoded = jwt.verify(token, JWT_SECRET);

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

// GET /api/users/addresses - List all addresses for current user
router.get('/addresses', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    const { data, error } = await supabase
      .from('delivery_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
  }
});

// POST /api/users/addresses - Create new address
router.post('/addresses', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const addressData = req.body;

    // Validate address data
    const validation = validateAddress(addressData);
    if (!validation.isValid) {
      return res.status(400).json({ error: 'Invalid address data', errors: validation.errors });
    }

    // Sanitize input
    const sanitized = sanitizeAddress(addressData);
    sanitized.user_id = userId;

    // Insert into database
    const { data, error } = await supabase
      .from('delivery_addresses')
      .insert(sanitized)
      .select('*')
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
  }
});

// PUT /api/users/addresses/:id - Update existing address
router.put('/addresses/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const addressId = req.params.id;
    const addressData = req.body;

    // Verify ownership
    const { data: existing, error: fetchErr } = await supabase
      .from('delivery_addresses')
      .select('user_id')
      .eq('id', addressId)
      .single();

    if (fetchErr || !existing) {
      return res.status(404).json({ error: 'Address not found' });
    }

    if (existing.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Validate address data
    const validation = validateAddress(addressData);
    if (!validation.isValid) {
      return res.status(400).json({ error: 'Invalid address data', errors: validation.errors });
    }

    // Sanitize input
    const sanitized = sanitizeAddress(addressData);

    // Update in database
    const { data, error } = await supabase
      .from('delivery_addresses')
      .update(sanitized)
      .eq('id', addressId)
      .select('*')
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
  }
});

// DELETE /api/users/addresses/:id - Delete address
router.delete('/addresses/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const addressId = req.params.id;

    // Verify ownership
    const { data: existing, error: fetchErr } = await supabase
      .from('delivery_addresses')
      .select('user_id')
      .eq('id', addressId)
      .single();

    if (fetchErr || !existing) {
      return res.status(404).json({ error: 'Address not found' });
    }

    if (existing.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete from database
    const { error } = await supabase
      .from('delivery_addresses')
      .delete()
      .eq('id', addressId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
  }
});

export default router;
