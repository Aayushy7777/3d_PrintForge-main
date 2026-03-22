const supabase = require('../config/supabaseClient');

/**
 * User Service
 * -------------
 * All database operations for the `users` table in Supabase.
 * Firebase UID is used as the primary `id` field.
 *
 * Table schema (run in Supabase SQL editor):
 *   CREATE TABLE IF NOT EXISTS users (
 *     id TEXT PRIMARY KEY,          -- Firebase UID
 *     email TEXT NOT NULL UNIQUE,
 *     name TEXT,
 *     created_at TIMESTAMPTZ DEFAULT NOW()
 *   );
 */

/**
 * Upsert a user profile (insert if new, update if exists).
 * Called automatically on first authenticated request.
 */
const upsertUser = async ({ uid, email, name }) => {
  const { data, error } = await supabase
    .from('users')
    .upsert({ id: uid, email, name }, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Get a single user by Firebase UID.
 */
const getUserById = async (uid) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', uid)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Get all users (admin use).
 */
const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Get a single user by email.
 */
const getUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    throw new Error(error.message);
  }
  return data;
};

/**
 * Create a new user.
 */
const createUser = async (name, email, hashedPassword) => {
  // Database schema differs across environments:
  // - Some setups use `password` (legacy)
  // - Others use `password_hash` (current in server/ auth routes)
  // Try `password_hash` first, then fall back to `password`.
  const tryInsert = async (payload) => {
    return await supabase.from('users').insert([payload]).select().single();
  };

  let result = await tryInsert({ name, email, password_hash: hashedPassword });

  // If schema doesn't have password_hash, attempt legacy column.
  if (result.error && /password_hash/i.test(result.error.message || '')) {
    result = await tryInsert({ name, email, password: hashedPassword });
  }

  const { data, error } = result;

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Update user fields by ID.
 */
const updateUser = async (id, updates) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Delete a user by ID.
 */
const deleteUser = async (id) => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  return { message: 'User deleted successfully.' };
};

module.exports = { 
  upsertUser, 
  getUserById, 
  getUserByEmail, 
  createUser, 
  getAllUsers, 
  updateUser, 
  deleteUser 
};
