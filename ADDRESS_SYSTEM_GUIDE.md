# Address Collection System - Implementation Guide

## Overview
Complete address collection system for checkout flow that captures delivery information after the user clicks checkout.

## Database Schema

### Supabase Table: `delivery_addresses`

Create this table in your Supabase project with the following structure:

```sql
CREATE TABLE delivery_addresses (
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

-- Create index for faster lookups
CREATE INDEX idx_delivery_addresses_user_id ON delivery_addresses(user_id);
```

### Update: `orders` Table

Add a new column to link orders with delivery addresses:

```sql
ALTER TABLE orders ADD COLUMN delivery_address_id UUID REFERENCES delivery_addresses(id) ON DELETE SET NULL;

-- Create index
CREATE INDEX idx_orders_delivery_address_id ON orders(delivery_address_id);
```

## Backend Implementation

### Files Created/Modified

1. **`server/lib/addressValidation.js`** (NEW)
   - Validation logic for address fields
   - Sanitization to prevent injection attacks
   - Regex patterns for phone, email, postal code

2. **`server/routes/orders.js`** (MODIFIED)
   - Added `POST /api/orders/address` endpoint with JWT authentication
   - Updated `POST /api/orders` to accept `delivery_address_id`
   - JWT verification middleware

### API Endpoints

#### 1. Save Address: `POST /api/orders/address`

**Request:**
```json
{
  "full_name": "John Doe",
  "phone_number": "+91 9876543210",
  "email": "john@example.com",
  "house_number": "123",
  "street": "Main Street",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "country": "United States",
  "delivery_instructions": "Leave at front door"
}
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Response (201 Created):**
```json
{
  "message": "Address saved successfully",
  "address_id": "550e8400-e29b-41d4-a716-446655440000",
  "address": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "user-uuid",
    "full_name": "John Doe",
    "phone_number": "+91 9876543210",
    "house_number": "123",
    "street": "Main Street",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "country": "United States",
    "delivery_instructions": "Leave at front door",
    "created_at": "2024-03-13T10:30:00Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Invalid address data",
  "errors": {
    "full_name": "Please enter a valid full name",
    "phone_number": "Invalid phone number format",
    "postal_code": "Invalid postal code format"
  }
}
```

#### 2. Create Order: `POST /api/orders`

**Request:**
```json
{
  "items": [
    {
      "productId": "123",
      "name": "Custom T-Shirt",
      "quantity": 2,
      "price": 499,
      "material": "Cotton",
      "color": "Blue"
    }
  ],
  "total": 998,
  "delivery_address_id": "550e8400-e29b-41d4-a716-446655440000",
  "customer": {
    "email": "john@example.com"
  }
}
```

**Response (201 Created):**
```json
{
  "id": "order-uuid",
  "items": [...],
  "total": 998,
  "delivery_address_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "createdAt": "2024-03-13T10:31:00Z"
}
```

## Frontend Implementation

### Components Created

1. **`src/components/checkout/AddressForm.tsx`** (NEW)
   - React Hook Form with Zod validation
   - Phone number, email, postal code validation
   - 10 form fields plus delivery instructions
   - Responsive design using Tailwind CSS
   - shadcn/ui components

2. **`src/components/checkout/AddressDialog.tsx`** (NEW)
   - Modal dialog wrapper for AddressForm
   - Opens when checkout is clicked
   - Closes on cancel or successful save

3. **`src/pages/Cart.tsx`** (MODIFIED)
   - Integrated AddressDialog
   - Fetch user email on mount
   - Handle checkout flow
   - Create order after address saved
   - Error handling and toast notifications

### Data Flow

```
1. User clicks "Checkout" button
   ↓
2. Check authentication token
   ↓
3. Open AddressDialog (shows AddressForm)
   ↓
4. User fills form and clicks "Confirm Address"
   ↓
5. Frontend validates form using Zod schema
   ↓
6. POST /api/orders/address (with JWT token)
   ↓
7. Backend validates and sanitizes data
   ↓
8. Backend stores in delivery_addresses table
   ↓
9. Return address_id to frontend
   ↓
10. Frontend creates order with delivery_address_id
    ↓
11. POST /api/orders (with JWT token)
    ↓
12. Backend stores order with address reference
    ↓
13. Show success toast
    ↓
14. Clear cart
```

## Form Fields & Validation

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| full_name | String | Yes | Min 2 chars |
| phone_number | String | Yes | Valid phone format (international) |
| email | String | No | Valid email if provided |
| house_number | String | Yes | Min 1 char |
| street | String | Yes | Min 3 chars |
| city | String | Yes | Min 2 chars |
| state | String | Yes | Min 2 chars |
| postal_code | String | Yes | 3-10 alphanumeric chars |
| country | String | Yes | From dropdown list |
| delivery_instructions | String | No | Max 500 chars |

## Security Features

1. **JWT Authentication**: All address operations require valid JWT token
2. **Input Validation**: Server-side validation using regex patterns
3. **Data Sanitization**: Trimming and length limits to prevent injection
4. **SQL Injection Prevention**: Using Supabase parameterized queries
5. **User Association**: Addresses automatically linked to authenticated user

## Authentication Requirements

Users must be logged in to:
1. Save a delivery address
2. Create an order

The JWT token should be stored in `localStorage` with key: `auth_token`

## Usage Example

### Frontend Integration

```typescript
// In Cart.tsx
const handleCheckout = () => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    // Show login prompt
    return;
  }
  // Open address dialog
  setShowAddressDialog(true);
};

const handleAddressSaved = async (addressId) => {
  // Create order with delivery_address_id
  const orderData = {
    items: items,
    total: totalPrice,
    delivery_address_id: addressId,
    customer: { email: userEmail }
  };

  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  });
};
```

## Testing Checklist

- [ ] Address form renders correctly
- [ ] All validation rules work (phone, email, postal code)
- [ ] Form submission requires authentication
- [ ] Address saved to database correctly
- [ ] Order created with address_id reference
- [ ] User cannot checkout without address
- [ ] Error messages display on validation failure
- [ ] Success toast shows after order creation
- [ ] Cart clears after order confirmation
- [ ] Address form accessible from cart page

## Troubleshooting

### Issue: "Authentication required" error
- **Solution**: Ensure user is logged in and JWT token is stored in localStorage with key `auth_token`

### Issue: Address validation fails
- **Solution**: Check phone number format (supports international format with + and -), postal code is 3-10 chars

### Issue: CORS errors
- **Solution**: Backend should have CORS enabled (already configured in server/index.js)

### Issue: Order not saving
- **Solution**: Ensure delivery_address_id column exists in orders table, check JWT token validity

## Future Enhancements

1. Save multiple addresses to user profile
2. Allow selecting from saved addresses
3. Address auto-complete using APIs
4. Delivery tracking integration
5. Email confirmation with address details
6. Address editing before order finalization
