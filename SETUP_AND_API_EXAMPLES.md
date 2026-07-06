# Setup Instructions & API Examples

## Quick Setup Guide

### 1. Database Setup (Supabase)

Run these SQL commands in your Supabase SQL editor:

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

-- Enable RLS (Row Level Security) if needed
ALTER TABLE delivery_addresses ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own addresses
CREATE POLICY "Users can view their own addresses" ON delivery_addresses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses" ON delivery_addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 2. Environment Variables

Ensure your `.env` files have:

**Backend (.env in /server):**
```
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
```

**Frontend (.env in root):**
```
VITE_API_URL=http://localhost:5000
```

### 3. File Structure

```
printflow-studio-main/
├── server/
│   ├── lib/
│   │   ├── supabase.js
│   │   └── addressValidation.js (NEW)
│   ├── routes/
│   │   ├── auth.js
│   │   ├── orders.js (MODIFIED)
│   │   └── products.js
│   └── index.js
├── src/
│   ├── components/
│   │   ├── checkout/ (NEW folder)
│   │   │   ├── AddressForm.tsx (NEW)
│   │   │   └── AddressDialog.tsx (NEW)
│   │   ├── layout/
│   │   ├── ui/
│   │   └── home/
│   ├── pages/
│   │   ├── Cart.tsx (MODIFIED)
│   │   └── ...
│   ├── contexts/
│   │   ├── CartContext.tsx
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── lib/
│   │   └── api.ts
│   └── App.tsx
└── ADDRESS_SYSTEM_GUIDE.md
```

## API Testing Examples

### Using cURL

#### 1. Register a User (if needed)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123",
    "name": "John Doe"
  }'

# Response:
# {
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": {
#     "id": "user-uuid",
#     "email": "test@example.com",
#     "name": "John Doe"
#   }
# }
```

#### 2. Save Address (requires JWT token)

```bash
curl -X POST http://localhost:5000/api/orders/address \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "full_name": "John Doe",
    "phone_number": "+91 9876543210",
    "email": "john@example.com",
    "house_number": "123",
    "street": "Main Street, Downtown",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "country": "United States",
    "delivery_instructions": "Leave at front door if not home"
  }'

# Response:
# {
#   "message": "Address saved successfully",
#   "address_id": "550e8400-e29b-41d4-a716-446655440000",
#   "address": {
#     "id": "550e8400-e29b-41d4-a716-446655440000",
#     "user_id": "user-uuid",
#     "full_name": "John Doe",
#     "phone_number": "+91 9876543210",
#     "email": "john@example.com",
#     "house_number": "123",
#     "street": "Main Street, Downtown",
#     "city": "New York",
#     "state": "NY",
#     "postal_code": "10001",
#     "country": "United States",
#     "delivery_instructions": "Leave at front door if not home",
#     "created_at": "2024-03-13T10:30:45.123Z"
#   }
# }
```

#### 3. Create Order with Address (requires JWT token)

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "items": [
      {
        "productId": "prod-123",
        "name": "Custom T-Shirt",
        "quantity": 2,
        "price": 499,
        "material": "Cotton",
        "color": "Blue"
      },
      {
        "productId": "prod-456",
        "name": "Custom Mug",
        "quantity": 1,
        "price": 299,
        "material": "Ceramic",
        "color": "White"
      }
    ],
    "total": 1297,
    "delivery_address_id": "550e8400-e29b-41d4-a716-446655440000",
    "customer": {
      "email": "john@example.com"
    }
  }'

# Response:
# {
#   "id": "order-uuid-here",
#   "items": [
#     {
#       "productId": "prod-123",
#       "name": "Custom T-Shirt",
#       "quantity": 2,
#       "price": 499,
#       "material": "Cotton",
#       "color": "Blue"
#     },
#     ...
#   ],
#   "total": 1297,
#   "delivery_address_id": "550e8400-e29b-41d4-a716-446655440000",
#   "status": "pending",
#   "createdAt": "2024-03-13T10:31:12.456Z",
#   "updatedAt": "2024-03-13T10:31:12.456Z"
# }
```

### Using Postman

1. **Create Collection**: "PrintForge API"
2. **Environment Variables**:
   ```
   base_url: http://localhost:5000
   jwt_token: (will be set after auth)
   ```

3. **Request 1 - Register**
   - Method: POST
   - URL: `{{base_url}}/api/auth/register`
   - Body (JSON):
     ```json
     {
       "email": "test@example.com",
       "password": "SecurePassword123",
       "name": "John Doe"
     }
     ```
   - After response, copy token and set as `jwt_token` in environment

4. **Request 2 - Save Address**
   - Method: POST
   - URL: `{{base_url}}/api/orders/address`
   - Headers: `Authorization: Bearer {{jwt_token}}`
   - Body (JSON): (use example above)
   - Save the `address_id` from response

5. **Request 3 - Create Order**
   - Method: POST
   - URL: `{{base_url}}/api/orders`
   - Headers: `Authorization: Bearer {{jwt_token}}`
   - Body (JSON): (use example above with saved address_id)

## Validation Error Examples

### Invalid Phone Number
```json
{
  "error": "Invalid address data",
  "errors": {
    "phone_number": "Invalid phone number format"
  }
}
```

### Invalid Postal Code
```json
{
  "error": "Invalid address data",
  "errors": {
    "postal_code": "Invalid postal code format"
  }
}
```

### Missing Required Fields
```json
{
  "error": "Invalid address data",
  "errors": {
    "full_name": "Please enter a valid full name",
    "house_number": "Please enter house/flat number"
  }
}
```

### Invalid Token
```json
{
  "error": "Invalid token"
}
```

### Missing Authorization
```json
{
  "error": "Missing authorization"
}
```

## Testing on Frontend

1. **Open Developer Console** (F12)
2. **Check localStorage**:
   ```javascript
   localStorage.getItem('auth_token')
   ```
3. **Test Address Form**:
   - Navigate to Cart page
   - Add items to cart
   - Click Checkout
   - Fill address form
   - Monitor Network tab for API calls
   - Check `delivery_addresses` table in Supabase

## Debugging Tips

### Check Backend Logs
```bash
# In server directory
npm run dev
# Watch console for request logs
```

### Database Query
```sql
-- Check addresses saved
SELECT * FROM delivery_addresses ORDER BY created_at DESC;

-- Check orders with addresses
SELECT
  o.id,
  o.status,
  o.total,
  da.full_name,
  da.city,
  da.phone_number
FROM orders o
LEFT JOIN delivery_addresses da ON o.delivery_address_id = da.id
ORDER BY o.created_at DESC;
```

### Frontend Network Inspection
1. Open DevTools Network tab
2. Look for POST requests to `/api/orders/address`
3. Check request headers for Authorization
4. Verify response status (201 for success)
5. Check response body for errors

### Debugging Token
```javascript
// On frontend, you can get the Supabase session:
const { data: { session } } = await supabase.auth.getSession();
console.log('Your token:', session?.access_token);
```
