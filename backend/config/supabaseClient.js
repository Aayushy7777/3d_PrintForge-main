const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables.');
}

/**
 * Supabase client instance.
 * Used across controllers/services for all DB operations.
 */
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
