const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

/**
 * Supabase Auth Middleware
 * -------------------------
 * Extracts the Bearer token from the Authorization header,
 * verifies it using Supabase, and attaches the
 * decoded user info (id, email) to req.user.
 *
 * Returns 503 if Supabase credentials are not yet configured.
 * Returns 401 if the token is missing or invalid.
 */

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found in environment variables.');
}

const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const supabaseAuthMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check for Authorization header with Bearer token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided.' });
  }

  const token = authHeader.split(' ')[1]; // Extract raw token

  try {
    // Prefer our app-issued JWTs (used by /api/auth/login and /api/auth/register)
    if (process.env.JWT_SECRET) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
          uid: decoded.id,
          email: decoded.email,
        };
        return next();
      } catch {
        // If verification fails, fall back to Supabase token verification (if configured)
      }
    }

    if (!supabase) {
      return res.status(503).json({ message: 'Auth provider not configured' });
    }

    // Verify the Supabase JWT token (if you are using Supabase Auth)
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Supabase token verification failed:', error?.message);
      return res.status(401).json({ message: 'Unauthorized: Invalid or expired token.' });
    }

    // If the DB schema uses public.users(id) (common in this repo),
    // translate Supabase auth user -> app user row by email.
    // Keep auth user id separately for reference.
    let appUserId = null;
    if (user.email) {
      const { data: appUser, error: appUserErr } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();

      if (appUserErr) {
        console.error('Failed to map auth user to app user:', appUserErr.message);
        return res.status(500).json({ message: 'Internal Server Error during authentication.' });
      }
      appUserId = appUser?.id || null;
    }

    if (!appUserId) {
      return res.status(401).json({
        message: 'Unauthorized: user profile not found. Please login again.',
      });
    }

    req.user = {
      uid: appUserId, // public.users.id (used by carts/orders FKs)
      auth_uid: user.id, // auth.users.id
      email: user.email,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(500).json({ message: 'Internal Server Error during authentication.' });
  }
};

module.exports = supabaseAuthMiddleware;
