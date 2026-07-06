import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_key';
process.env.RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret';

const { normalizeMaterial } = await import('./src/utils/materials.js');
const {
  buildRazorpayOrderOptions,
  verifyRazorpaySignature,
} = await import('./src/routes/payments.js');
const { setSupabaseClient } = await import('./lib/supabase.js');
const { createApp } = await import('./app.js');

function createSupabaseMock() {
  return {
    from(table) {
      const state = { table, filters: {} };

      const builder = {
        select() {
          return builder;
        },
        eq(column, value) {
          state.filters[column] = value;
          return builder;
        },
        maybeSingle() {
          if (state.table === 'users') {
            return Promise.resolve({
              data: {
                id: state.filters.id,
                email: 'customer@example.com',
                name: 'Customer',
                role: 'customer',
              },
              error: null,
            });
          }

          return Promise.resolve({ data: null, error: null });
        },
      };

      return builder;
    },
  };
}

async function testMaterialValidation() {
  assert.equal(normalizeMaterial(undefined), 'PLA');
  assert.equal(normalizeMaterial('pla'), 'PLA');
  assert.equal(normalizeMaterial('PETG'), null);
}

async function testRazorpayOrderCreationOptions() {
  const options = buildRazorpayOrderOptions({ total_amount: 123.45, currency: 'INR' }, 'order_123');
  assert.deepEqual(options, {
    amount: 12345,
    currency: 'INR',
    receipt: 'receipt_order_123',
  });
}

async function testRazorpaySignatureVerification() {
  const secret = 'secret';
  const razorpay_order_id = 'order_test';
  const razorpay_payment_id = 'pay_test';
  const razorpay_signature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  assert.equal(
    verifyRazorpaySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }, secret),
    true
  );
  assert.equal(
    verifyRazorpaySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature: 'bad' }, secret),
    false
  );
}

async function testAdminOrdersBlockedForCustomer() {
  setSupabaseClient(createSupabaseMock());

  const app = createApp();
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const token = jwt.sign({ id: 'user_1', email: 'customer@example.com' }, process.env.JWT_SECRET);
    const response = await fetch(`http://127.0.0.1:${port}/api/admin/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    assert.equal(response.status, 403);
    const body = await response.json();
    assert.match(body.error, /Admin access required/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

await testMaterialValidation();
await testRazorpayOrderCreationOptions();
await testRazorpaySignatureVerification();
await testAdminOrdersBlockedForCustomer();

console.log('Payment/admin backend tests passed.');
