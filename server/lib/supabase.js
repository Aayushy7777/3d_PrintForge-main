import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let client = null;

if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
} else if (process.env.NODE_ENV !== 'test') {
  console.warn(
    '⚠️ Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — database access is disabled until configured.'
  );
}

/**
 * Test-only hook: inject a fake Supabase client.
 * Never call this from production code.
 */
export function setSupabaseClient(fakeClient) {
  client = fakeClient;
}

/**
 * Proxy so every consumer always talks to the *current* client
 * (real one in production, injected fake in tests).
 */
export const supabase = new Proxy(
  {},
  {
    get(_target, prop) {
      if (!client) {
        throw new Error(
          'Supabase client not configured (missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)'
        );
      }
      const value = client[prop];
      return typeof value === 'function' ? value.bind(client) : value;
    },
  }
);
