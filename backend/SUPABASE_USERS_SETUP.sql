-- =============================================
-- PrintForge: Users Table Setup
-- Run this in Supabase SQL Editor
-- =============================================

-- Create users table (Firebase UID as primary key)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,               -- Firebase UID (e.g. "abc123XYZ")
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: Enable Row Level Security (recommended)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own row
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (id = auth.uid()::TEXT);

-- Policy: Users can update their own row
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (id = auth.uid()::TEXT);
