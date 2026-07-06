# 🔍 Verify Setup & Fix "Failed to fetch address" Error

## Step 1: Check Supabase Database Table (Most Likely Issue)

The error "Failed to fetch address" usually means the **`delivery_addresses` table doesn't exist**.

### ✅ To Fix This:

1. Go to:
   **https://supabase.com** → Your Project → **SQL Editor**

2. **Copy and paste this entire SQL block** to create the table:

```sql
-- Create delivery_addresses table
CREATE TABLE IF NOT EXISTS delivery_addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  house_number VARCHAR(50) NOT NULL,
  street VARCHAR(100) NOT NULL,
  city VARCHAR(50) NOT NULL,
  state VARCHAR(50) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(50) NOT NULL,
  delivery_instructions TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add delivery_address_id to orders table if not exists
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address_id UUID REFERENCES delivery_addresses(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_delivery_addresses_user_id ON delivery_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_address_id ON orders(delivery_address_id);
```

3. Click **"Run"** button
4. Wait for success message (should see ✓ checks)
5. Refresh your browser and try adding an address again

---

## Step 2: Verify Backend is Running

### Terminal Check:

```bash
# In /server directory
npm run dev

# Should show:
# Server listening on port 5000
```

### Quick API Test:

```bash
curl http://localhost:5000/

# Should return:
# {"status":"ok","message":"PrintForge backend (Express + Supabase)"}
```

---

## Step 3: Verify Frontend is Running

- Should be running on **http://localhost:8080/**
- Check browser title bar - should NOT show an error

---

## Step 4: Test Address Save (Complete Verification)

1. Open http://localhost:8080/profile
2. Click "Saved Addresses" tab
3. Click "Add New Address" button
4. **Open DevTools** (Press **F12**)
5. Go to **Console** tab
6. Fill in address form:
   - **Full Name**: Test User
   - **Phone**: +91 9876543210
   - **House**: 123
   - **Street**: Test Street
   - **City**: Mumbai
   - **State**: MH
   - **Postal Code**: 400001
   - **Country**: India
7. Click "Add Address"

### ✅ Look for Success Signs in Console:

```
Token retrieved: YES
Sending request: {method: 'POST', url: '/api/users/addresses', ...}
Response status: 201
Success: {id: '...', full_name: 'Test User', ...}
```

### ❌ If You See an Error:

**Copy the entire Console output and share it with me!**

Key things to look for:
- `Response status: 401` → Token/Auth issue
- `Response status: 400` → Validation error (See Error data field)
- `Response status: 500` → Backend/Database error
- `Token retrieved: NO` → Firebase auth issue

---

## Step 5: If Still Not Working

### Check Network Tab

1. Open DevTools **Network** tab (F12 → Network)
2. Try adding address again
3. Look for **POST** request to `/api/users/addresses`
4. Click on it
5. Check **Response** tab - copy the error message

### Check Backend Terminal

Look for any **red error messages** in the terminal where you ran `npm run dev`

---

## Checklist (Before Reporting)

- [ ] Backend running? (`npm run dev` shows "Server listening on port 5000")
- [ ] Frontend accessible? (Can visit http://localhost:8080)
- [ ] Logged in? (See your avatar in navbar)
- [ ] Supabase table created? (Ran SQL above)
- [ ] `.env` files configured? (Backend has SUPABASE_URL, etc.)

---

## Quick Fixes for Common Errors

| Error | Fix |
|-------|-----|
| `Failed to fetch address` | Create `delivery_addresses` table in Supabase (Step 1 above) |
| `Token retrieved: NO` | Logout → Clear browser cache (Ctrl+Shift+Del) → Login again |
| `Response status: 400` | Check Console for validation errors, fill all required fields |
| `Response status: 401` | Token invalid, try logout/login again |
| `Response status: 500` | Backend error, check terminal for error message |

---

**Once fixed, you should see:**
✅ Toast notification: "Address added successfully"
✅ Address appears in your Saved Addresses list
✅ No console errors
