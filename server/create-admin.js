#!/usr/bin/env node
// Create an admin user in the PrintForge `users` table.
//
// Usage:
//   node create-admin.js <email> <password>
//
// Behavior:
//   - If the email already exists, its OLD account is DELETED first (which also
//     removes any previous password / login) and then re-created as a fresh
//     admin account with the given password. This guarantees login works with
//     the credentials you pass in.
//   - Requires real SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in server/.env.

import bcrypt from 'bcryptjs';
import { supabase } from './lib/supabase.js';

const PLACEHOLDER = 'your_supabase_url';

async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.error('Usage: node create-admin.js <email> <password>');
    process.exit(1);
  }

  // Friendly early check instead of a raw stack trace.
  if (process.env.SUPABASE_URL?.includes(PLACEHOLDER) || !process.env.SUPABASE_URL) {
    console.error(
      '❌ server/.env still has a placeholder/invalid SUPABASE_URL.\n' +
      '   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (Supabase → Project Settings → API),\n' +
      '   then run this script again.'
    );
    process.exit(1);
  }

  // 1. Remove the account if it was used before, so there's no conflicting login.
  const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
  if (existing) {
    const { error: delErr } = await supabase.from('users').delete().eq('id', existing.id);
    if (delErr) throw delErr;
    console.log(`🗑️  Removed existing account for ${email} (cleared old login).`);
  }

  // 2. Create a fresh admin account.
  const hash = await bcrypt.hash(password, 10);
  const { data: created, error: insertErr } = await supabase
    .from('users')
    .insert({
      email,
      password_hash: hash,
      name: email.split('@')[0],
      role: 'admin',
    })
    .select('id, email, role')
    .single();
  if (insertErr) throw insertErr;

  console.log(`✅ Admin created: ${created.email} (role=${created.role})`);
  console.log('   Log in at /login with this email and the password you passed, then visit /admin.');
}

main().catch((err) => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
