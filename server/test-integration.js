import 'dotenv/config';
import { supabase } from './lib/supabase.js';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testDatabaseConnection() {
  log('\n=== Testing Database Connection ===', 'blue');
  
  try {
    // Test users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (usersError) {
      log(`❌ Users table error: ${usersError.message}`, 'red');
      return false;
    }
    log('✅ Users table accessible', 'green');

    // Test products table
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('count')
      .limit(1);
    
    if (productsError) {
      log(`❌ Products table error: ${productsError.message}`, 'red');
      return false;
    }
    log('✅ Products table accessible', 'green');

    // Test orders table
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('count')
      .limit(1);
    
    if (ordersError) {
      log(`❌ Orders table error: ${ordersError.message}`, 'red');
      return false;
    }
    log('✅ Orders table accessible', 'green');

    return true;
  } catch (err) {
    log(`❌ Database connection failed: ${err.message}`, 'red');
    return false;
  }
}

async function testProductsData() {
  log('\n=== Testing Products Data ===', 'blue');
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, in_stock')
      .limit(5);

    if (error) {
      log(`❌ Failed to fetch products: ${error.message}`, 'red');
      return false;
    }

    if (!data || data.length === 0) {
      log('⚠️  No products found. Run: npm run seed', 'yellow');
      return true; // Not an error, just empty
    }

    log(`✅ Found ${data.length} products`, 'green');
    data.forEach((p) => {
      log(`   - ${p.name} (${p.id}) - $${p.price}`, 'reset');
    });

    return true;
  } catch (err) {
    log(`❌ Products test failed: ${err.message}`, 'red');
    return false;
  }
}

async function testUserOperations() {
  log('\n=== Testing User Operations ===', 'blue');
  
  try {
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'test123456';

    // Test registration
    const bcrypt = (await import('bcrypt')).default;
    const hash = await bcrypt.hash(testPassword, 10);

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({ email: testEmail, password_hash: hash, name: 'Test User' })
      .select('id, email, name')
      .single();

    if (insertError) {
      log(`❌ User creation failed: ${insertError.message}`, 'red');
      return false;
    }
    log(`✅ User created: ${newUser.email}`, 'green');

    // Test user lookup
    const { data: foundUser, error: lookupError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', testEmail)
      .maybeSingle();

    if (lookupError || !foundUser) {
      log(`❌ User lookup failed: ${lookupError?.message || 'Not found'}`, 'red');
      return false;
    }
    log(`✅ User lookup successful: ${foundUser.email}`, 'green');

    // Cleanup test user
    await supabase.from('users').delete().eq('id', newUser.id);
    log('✅ Test user cleaned up', 'green');

    return true;
  } catch (err) {
    log(`❌ User operations test failed: ${err.message}`, 'red');
    return false;
  }
}

async function testEnvironmentVariables() {
  log('\n=== Testing Environment Variables ===', 'blue');
  
  const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET'];
  let allPresent = true;

  required.forEach((key) => {
    if (process.env[key]) {
      const value = key === 'JWT_SECRET' ? '***' : process.env[key];
      log(`✅ ${key}: ${value.substring(0, 30)}...`, 'green');
    } else {
      log(`❌ ${key}: Missing`, 'red');
      allPresent = false;
    }
  });

  return allPresent;
}

async function runAllTests() {
  log('\n🚀 Starting Integration Tests...', 'blue');
  log('='.repeat(50), 'blue');

  const results = {
    env: await testEnvironmentVariables(),
    db: await testDatabaseConnection(),
    products: await testProductsData(),
    users: await testUserOperations(),
  };

  log('\n' + '='.repeat(50), 'blue');
  log('📊 Test Results Summary:', 'blue');
  log('='.repeat(50), 'blue');

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`${status} - ${test}`, color);
  });

  const allPassed = Object.values(results).every((r) => r);
  
  if (allPassed) {
    log('\n🎉 All tests passed! Integration is working correctly.', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Some tests failed. Please check the errors above.', 'yellow');
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  log(`\n💥 Fatal error: ${err.message}`, 'red');
  console.error(err);
  process.exit(1);
});
