import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  // Fail fast in dev; avoids issuing weak tokens in production by accident.
  throw new Error('Missing JWT_SECRET in environment');
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const { data: existing, error: existingErr } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingErr) return res.status(500).json({ error: existingErr.message });
    if (existing) return res.status(409).json({ error: 'User already exists' });

    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    const { data: created, error: createErr } = await supabase
      .from('users')
      .insert({ email, password_hash: hash, name: name ?? null })
      .select('id,email,name')
      .single();

    if (createErr) return res.status(400).json({ error: createErr.message });

    const token = jwt.sign({ id: created.id, email: created.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: created.id, email: created.email, name: created.name ?? undefined } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const { data: user, error } = await supabase
      .from('users')
      .select('id,email,name,password_hash')
      .eq('email', email)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name ?? undefined } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Missing authorization' });
    const parts = auth.split(' ');
    if (parts.length !== 2) return res.status(401).json({ error: 'Invalid authorization format' });
    const token = parts[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const { data: user, error } = await supabase
      .from('users')
      .select('id,email,name')
      .eq('id', decoded.id)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ id: user.id, email: user.email, name: user.name ?? undefined });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
