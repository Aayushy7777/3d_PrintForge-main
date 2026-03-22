const express = require('express');
const { body } = require('express-validator');

const supabaseAuthMiddleware = require('../middleware/supabaseAuthMiddleware');
const {
  getMyProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

const router = express.Router();

// All user routes are protected — require valid Supabase JWT Token
router.use(supabaseAuthMiddleware);

// ---------------------------------------------------------------------------
// Addresses (used by Profile + Checkout)
// Endpoints expected by frontend:
// - GET    /api/users/addresses
// - POST   /api/users/addresses
// - PUT    /api/users/addresses/:id
// - DELETE /api/users/addresses/:id
// ---------------------------------------------------------------------------
const supabase = require('../config/supabaseClient');

router.get('/addresses', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('delivery_addresses')
      .select('*')
      .eq('user_id', req.user.uid)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    return res.json(data || []);
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
  }
});

router.post('/addresses', async (req, res) => {
  try {
    const payload = { ...(req.body || {}), user_id: req.user.uid };

    const { data, error } = await supabase
      .from('delivery_addresses')
      .insert(payload)
      .select('*')
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data);
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
  }
});

router.put('/addresses/:id', async (req, res) => {
  try {
    const addressId = req.params.id;

    const { data: existing, error: fetchErr } = await supabase
      .from('delivery_addresses')
      .select('id,user_id')
      .eq('id', addressId)
      .maybeSingle();

    if (fetchErr) return res.status(400).json({ error: fetchErr.message });
    if (!existing) return res.status(404).json({ error: 'Address not found' });
    if (existing.user_id !== req.user.uid) return res.status(403).json({ error: 'Unauthorized' });

    const { data, error } = await supabase
      .from('delivery_addresses')
      .update(req.body || {})
      .eq('id', addressId)
      .select('*')
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
  }
});

router.delete('/addresses/:id', async (req, res) => {
  try {
    const addressId = req.params.id;

    const { data: existing, error: fetchErr } = await supabase
      .from('delivery_addresses')
      .select('id,user_id')
      .eq('id', addressId)
      .maybeSingle();

    if (fetchErr) return res.status(400).json({ error: fetchErr.message });
    if (!existing) return res.status(404).json({ error: 'Address not found' });
    if (existing.user_id !== req.user.uid) return res.status(403).json({ error: 'Unauthorized' });

    const { error } = await supabase.from('delivery_addresses').delete().eq('id', addressId);
    if (error) return res.status(400).json({ error: error.message });

    return res.status(204).end();
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
  }
});

/**
 * GET /api/users/profile
 * Returns the authenticated user's own profile.
 * Auto-creates the Supabase record if this is their first login.
 */
router.get('/profile', getMyProfile);

/**
 * GET /api/users
 * Returns all users.
 */
router.get('/', getAllUsers);

/**
 * GET /api/users/:id
 * Returns a specific user by Firebase UID.
 */
router.get('/:id', getUserById);

/**
 * PUT /api/users/:id
 * Updates user's name field.
 */
router.put(
  '/:id',
  [body('name').trim().notEmpty().withMessage('Name is required.')],
  updateUser
);

/**
 * DELETE /api/users/:id
 * Deletes the user's Supabase record.
 */
router.delete('/:id', deleteUser);

module.exports = router;
