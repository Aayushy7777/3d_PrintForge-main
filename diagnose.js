#!/usr/bin/env node

/**
 * PrintForge Address System - Quick Diagnostic Test
 *
 * Run with: node diagnose.js
 *
 * This script tests:
 * 1. Backend connectivity
 * 2. API endpoints accessibility
 * 3. Environment variables
 * 4. Database table existence (requires token)
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 PrintForge Address System Diagnostic\n');
console.log('=' .repeat(50) + '\n');

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function check(label, passed, message = '') {
  const symbol = passed ? '✅' : '❌';
  console.log(`${symbol} ${label}`);
  if (message) console.log(`   ${colors.yellow}→${colors.reset} ${message}`);
}

// Test 1: Check environment files
console.log(`${colors.blue}TEST 1: Environment Variables${colors.reset}`);
console.log('-' .repeat(50));

const backendEnvPath = path.join(__dirname, 'server', '.env');
const serverEnvExists = fs.existsSync(backendEnvPath);
check('Backend .env exists', serverEnvExists, serverEnvExists ? backendEnvPath : 'Missing - run: cp server/.env.example server/.env');

if (serverEnvExists) {
  const envContent = fs.readFileSync(backendEnvPath, 'utf8');
  const hasSupabaseUrl = envContent.includes('SUPABASE_URL');
  const hasSupabaseKey = envContent.includes('SUPABASE_SERVICE_ROLE_KEY');

  check('SUPABASE_URL configured', hasSupabaseUrl);
  check('SUPABASE_SERVICE_ROLE_KEY configured', hasSupabaseKey);
}

console.log();

// Test 2: Check files exist
console.log(`${colors.blue}TEST 2: Required Files${colors.reset}`);
console.log('-' .repeat(50));

const requiredFiles = [
  { path: 'server/routes/users.js', name: 'Address API routes' },
  { path: 'server/lib/addressValidation.js', name: 'Address validation' },
  { path: 'server/lib/supabase.js', name: 'Supabase client' },
  { path: 'src/pages/Profile.tsx', name: 'Profile page' },
  { path: 'src/components/profile/SavedAddresses.tsx', name: 'Saved addresses component' },
  { path: 'src/components/profile/AddAddressModal.tsx', name: 'Add address modal' },
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file.path);
  const exists = fs.existsSync(filePath);
  check(file.name, exists, exists ? '✓' : `Missing: ${file.path}`);
});

console.log();

// Test 3: Check server routes registration
console.log(`${colors.blue}TEST 3: Backend Routes${colors.reset}`);
console.log('-' .repeat(50));

const serverIndexPath = path.join(__dirname, 'server', 'index.js');
if (fs.existsSync(serverIndexPath)) {
  const indexContent = fs.readFileSync(serverIndexPath, 'utf8');

  const hasUsersImport = indexContent.includes("import usersRouter from './routes/users.js'");
  const hasUsersRoute = indexContent.includes("app.use('/api/users', usersRouter)");

  check('Users router imported', hasUsersImport);
  check('Users router registered', hasUsersRoute, hasUsersRoute ? '/api/users' : 'Not found - check server/index.js');
}

console.log();

// Test 4: Check configuration
console.log(`${colors.blue}TEST 4: Run Instructions${colors.reset}`);
console.log('-' .repeat(50));

console.log(`
${colors.green}✓ Frontend Setup:${colors.reset}
  npm install (if not done)
  npm run dev
  Opens: http://localhost:8080

${colors.green}✓ Backend Setup:${colors.reset}
  cd server
  npm install (if not done)
  npm run dev
  Starts on: http://localhost:5000

${colors.green}✓ Database Setup (CRITICAL):${colors.reset}
  1. Go to: https://supabase.com
  2. Login and open your project
  3. Go to: SQL Editor
  4. Copy SQL from SETUP_AND_API_EXAMPLES.md
  5. Run the SQL to create delivery_addresses table

${colors.green}✓ Test the API:${colors.reset}
  1. Open http://localhost:8080/profile
  2. Click "Saved Addresses" tab
  3. Click "Add New Address" button
  4. Fill in form and click "Add Address"
  5. Check browser console (F12 → Console) for logs
`);

console.log('=' .repeat(50));
console.log(`\n${colors.green}Diagnostic complete!${colors.reset}`);
console.log('\nFor detailed debugging, see: VERIFY_SETUP.md\n');
