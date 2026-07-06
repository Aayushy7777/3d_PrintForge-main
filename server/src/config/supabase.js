// Single shared Supabase client for the whole backend.
// Re-exported from lib/supabase.js so production code and tests
// always reference the same (injectable) instance.
export { supabase, setSupabaseClient } from '../../lib/supabase.js';
