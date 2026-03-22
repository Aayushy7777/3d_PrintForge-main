
import { v4 as uuidv4 } from 'uuid';

const API_URL = 'http://localhost:5001/api';

async function test() {
  try {
    console.log('--- Starting Cart Flow Verification ---');

    // 1. Register a test user
    const email = `testuser_${Date.now()}@example.com`;
    const password = 'password123';
    console.log(`Registering user: ${email}`);

    const registerRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name: 'Test User' }),
    });

    let token;
    if (registerRes.ok) {
      const data = await registerRes.json();
      token = data.token;
      console.log('Registered successfully.');
    } else {
      // If user exists, try login
      console.log('Registration failed, trying login...');
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.statusText}`);
      const data = await loginRes.json();
      token = data.token;
      console.log('Logged in successfully.');
    }

    if (!token) throw new Error('No auth token obtained');

    // 2. Get a product
    console.log('Fetching products...');
    const productsRes = await fetch(`${API_URL}/products`);
    if (!productsRes.ok) throw new Error(`Products fetch failed: ${productsRes.statusText}`);
    const productsData = await productsRes.json();
    
    // Check if products array exists and has items
    const products = productsData.products || productsData; // Handle pagination if wrapped
    if (!products || products.length === 0) {
        throw new Error('No products found in DB. Cannot test cart.');
    }
    
    const productId = products[0].id;
    console.log(`Using Product ID: ${productId} (${products[0].name})`);

    // 3. Add to Cart
    console.log('Adding to cart...');
    const addToCartRes = await fetch(`${API_URL}/cart/items`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ product_id: productId, quantity: 2 }),
    });

    if (!addToCartRes.ok) {
        const errText = await addToCartRes.text();
        throw new Error(`Add to cart failed: ${addToCartRes.status} ${errText}`);
    }
    const addedItem = await addToCartRes.json();
    console.log('Item added:', addedItem);

    // 4. Fetch Cart
    console.log('Fetching cart...');
    const getCartRes = await fetch(`${API_URL}/cart`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!getCartRes.ok) throw new Error('Get cart failed');
    const cart = await getCartRes.json();
    
    console.log('Cart fetched:', JSON.stringify(cart, null, 2));

    if (cart.cart_items && cart.cart_items.length > 0) {
        console.log('SUCCESS: Cart flow verified!');
    } else {
        console.error('FAILURE: Cart is empty after adding item.');
    }

  } catch (error) {
    console.error('TEST FAILED:', error);
  }
}

test();
