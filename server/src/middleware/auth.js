import { supabase } from '../config/supabase.js';
import { AppError } from './errorHandler.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Missing authorization token', 401));
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return next(new AppError('Invalid or expired token', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    // First ensure they are authenticated
    await requireAuth(req, res, async (err) => {
      if (err) return next(err);

      // Check profiles table for admin role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', req.user.id)
        .single();

      if (error || !profile || profile.role !== 'admin') {
        return next(new AppError('Forbidden: Admin access required', 403));
      }

      next();
    });
  } catch (error) {
    next(error);
  }
};
