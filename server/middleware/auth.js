import jwt from 'jsonwebtoken';
import { supabase } from '../lib/supabase.js';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing JWT_SECRET in environment');
  }
  return secret;
};

export const requireAuth = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Missing authorization' });

    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer')
      return res.status(401).json({ error: 'Invalid authorization format' });

    const token = parts[1];
    const decoded = jwt.verify(token, getJwtSecret());

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token or user not found' });
    }

    // Only expose safe fields downstream (never password_hash).
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'customer',
    };
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Admin gate built on top of requireAuth (same JWT flow the rest of the
 * app uses). The user's role is read from the `users` table so a stale
 * token can never grant admin access.
 */
export const requireAdmin = async (req, res, next) => {
  await requireAuth(req, res, (err) => {
    if (err) return next(err);

    if (!req.user || String(req.user.role).toLowerCase() !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    next();
  });
};
