# Saved Addresses Feature - Complete Implementation Guide

## Overview

Complete profile system with saved addresses management, allowing users to add, edit, delete, and manage multiple delivery addresses.

---

## 📁 Files Created/Modified

### Frontend Components

1. **`src/pages/Profile.tsx`** (NEW)
   - Main profile page with sidebar navigation
   - Four sections: Account, Orders, Addresses, Settings
   - Redirects to login if not authenticated

2. **`src/components/profile/SavedAddresses.tsx`** (NEW)
   - Main addresses component
   - Fetch, display, and manage addresses
   - Empty state handling
   - Loading skeleton
   - Delete confirmation

3. **`src/components/profile/AddressCard.tsx`** (NEW)
   - Individual address display card
   - Edit and Delete buttons
   - Clean card design with location icon

4. **`src/components/profile/AddAddressModal.tsx`** (NEW)
   - Modal form for adding/editing addresses
   - React Hook Form + Zod validation
   - Same validation as checkout form
   - Reusable for add and edit operations

### Backend Routes

5. **`server/routes/users.js`** (NEW)
   - GET /api/users/addresses
   - POST /api/users/addresses
   - PUT /api/users/addresses/:id
   - DELETE /api/users/addresses/:id
   - JWT authentication middleware
   - Address validation and sanitization

### Configuration

6. **`server/index.js`** (MODIFIED)
   - Imported users router
   - Registered `/api/users` routes

7. **`src/App.tsx`** (MODIFIED)
   - Imported Profile component
   - Added `/profile` route

---

## 🎯 Features

✅ **View Saved Addresses**
- List all addresses for logged-in user
- Display with comprehensive details
- Clean card layout

✅ **Add New Address**
- Modal form for new addresses
- Field validation
- Dropdown country selector

✅ **Edit Address**
- Pre-fill form with existing data
- Update existing address
- Maintain address relationships

✅ **Delete Address**
- Confirmation before deletion
- Permanent removal
- User feedback via toast

✅ **User Account Section**
- Display user info
- Show email and name
- Profile management section

✅ **Orders Section**
- Placeholder for future order history
- Clean empty state

✅ **Settings Section**
- Email notifications
- Newsletter subscription
- Future preference management

✅ **Responsive Design**
- Two-column layout on desktop
- Single column on mobile
- Sticky sidebar
- Proper spacing

---

## 📊 Database Schema

### delivery_addresses table (Already created)

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

CREATE INDEX idx_delivery_addresses_user_id ON delivery_addresses(user_id);
```

---

## 🔌 API Endpoints

### 1. Get All Addresses

**Endpoint:** `GET /api/users/addresses`

**Request:**
```http
GET /api/users/addresses HTTP/1.1
Authorization: Bearer <TOKEN>
Content-Type: application/json
```

**Response (200 OK):**
```json
[
  {
    "id": "address-uuid-1",
    "user_id": "user-uuid",
    "full_name": "John Doe",
    "phone_number": "+91 9876543210",
    "email": "john@example.com",
    "house_number": "123",
    "street": "Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postal_code": "400001",
    "country": "India",
    "delivery_instructions": "Ring doorbell twice",
    "created_at": "2024-03-13T10:30:00Z"
  }
]
```

**Error (401):**
```json
{
  "error": "Missing authorization"
}
```

---

### 2. Create New Address

**Endpoint:** `POST /api/users/addresses`

**Request:**
```http
POST /api/users/addresses HTTP/1.1
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "full_name": "Jane Doe",
  "phone_number": "+91 9876543211",
  "email": "jane@example.com",
  "house_number": "456",
  "street": "Park Avenue",
  "city": "Delhi",
  "state": "Delhi",
  "postal_code": "110001",
  "country": "India",
  "delivery_instructions": "Leave at security gate"
}
```

**Response (201 Created):**
```json
{
  "id": "address-uuid-2",
  "user_id": "user-uuid",
  "full_name": "Jane Doe",
  "phone_number": "+91 9876543211",
  "email": "jane@example.com",
  "house_number": "456",
  "street": "Park Avenue",
  "city": "Delhi",
  "state": "Delhi",
  "postal_code": "110001",
  "country": "India",
  "delivery_instructions": "Leave at security gate",
  "created_at": "2024-03-13T10:35:00Z"
}
```

**Error (400):**
```json
{
  "error": "Invalid address data",
  "errors": {
    "phone_number": "Invalid phone number format",
    "postal_code": "Invalid postal code format"
  }
}
```

---

### 3. Update Address

**Endpoint:** `PUT /api/users/addresses/:id`

**Request:**
```http
PUT /api/users/addresses/address-uuid-1 HTTP/1.1
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "full_name": "John Smith",
  "phone_number": "+91 9876543212",
  "house_number": "123A",
  "street": "Main Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "postal_code": "400001",
  "country": "India"
}
```

**Response (200 OK):**
```json
{
  "id": "address-uuid-1",
  "user_id": "user-uuid",
  "full_name": "John Smith",
  "phone_number": "+91 9876543212",
  "house_number": "123A",
  "street": "Main Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "postal_code": "400001",
  "country": "India",
  "delivery_instructions": "Ring doorbell twice",
  "created_at": "2024-03-13T10:30:00Z"
}
```

**Error (403):**
```json
{
  "error": "Unauthorized"
}
```

---

### 4. Delete Address

**Endpoint:** `DELETE /api/users/addresses/:id`

**Request:**
```http
DELETE /api/users/addresses/address-uuid-1 HTTP/1.1
Authorization: Bearer <TOKEN>
```

**Response (200 OK):**
```json
{
  "message": "Address deleted successfully"
}
```

**Error (404):**
```json
{
  "error": "Address not found"
}
```

---

## 🔐 Security Features

✅ **JWT Authentication** - All endpoints require valid token
✅ **User Isolation** - Users can only access their own addresses
✅ **Ownership Verification** - Edit/delete validates user ownership
✅ **Input Validation** - Regex patterns for phone, email, postal code
✅ **Data Sanitization** - Trim and substring limits
✅ **SQL Injection Prevention** - Parameterized Supabase queries

---

## 🎨 UI Components

### Layout Structure

```
Profile Page
├── Navbar (top)
├── Header (My Account + Logout)
└── Main Layout
    ├── Sidebar (sticky)
    │   ├── User Info
    │   └── Menu Items
    │       ├── Account
    │       ├── Orders
    │       ├── Saved Addresses ← Current Feature
    │       └── Settings
    └── Content Area
        └── SavedAddresses Component
            ├── Button: Add New Address
            ├── Address Cards (Grid)
            │   └── AddressCard
            │       ├── Location Icon
            │       ├── Address Details
            │       └── Action Buttons (Edit, Delete)
            └── AddAddressModal
                └── Address Form
```

### Loading State

Shows skeleton cards while fetching addresses

### Empty State

Shows message "No saved addresses yet" with Add button

---

## 🧪 Testing

### Test Address Form

Valid Address:
```
Full Name: John Doe
Phone: +91 9876543210
House: 123
Street: Main Street
City: Mumbai
State: Maharashtra
Postal Code: 400001
Country: India
```

### Test API with cURL

```bash
# Get addresses
curl -X GET http://localhost:5000/api/users/addresses \
  -H "Authorization: Bearer YOUR_TOKEN"

# Add address
curl -X POST http://localhost:5000/api/users/addresses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Jane Doe",
    "phone_number": "+91 9876543211",
    "house_number": "456",
    "street": "Park Avenue",
    "city": "Delhi",
    "state": "Delhi",
    "postal_code": "110001",
    "country": "India"
  }'

# Update address
curl -X PUT http://localhost:5000/api/users/addresses/ADDRESS_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...address data...}'

# Delete address
curl -X DELETE http://localhost:5000/api/users/addresses/ADDRESS_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🚀 How to Use

### 1. Navigate to Profile

- Click on user avatar/profile link in navbar
- Or go to `/profile` URL
- System redirects to login if not authenticated

### 2. View Saved Addresses

- Click "Saved Addresses" in sidebar
- See all saved addresses in card format
- Each card shows full address details

### 3. Add New Address

- Click "Add New Address" button
- Fill all required fields
- Click "Add Address"
- Address appears in list

### 4. Edit Address

- Click "Edit" button on any address card
- Form pre-fills with current data
- Modify and click "Update Address"
- Changes saved immediately

### 5. Delete Address

- Click "Delete" button on any address card
- Confirm in dialog
- Address removed from list

---

## 🔧 Installation Checklist

- [ ] database/delivery_addresses table exists
- [ ] backend/routes/users.js created
- [ ] server/index.js has users router imported and registered
- [ ] frontend/pages/Profile.tsx created
- [ ] frontend/components/profile/*.tsx components created
- [ ] src/App.tsx has Profile route added
- [ ] Test addresses API with cURL
- [ ] Test profile page navigation
- [ ] Test add/edit/delete functionality
- [ ] Test responsive design on mobile

---

## 📱 Responsive Design

- **Desktop (lg+):** 3-column grid for cards + sticky sidebar
- **Tablet (md):** 2-column grid for cards
- **Mobile (sm):** 1-column layout, sidebar hidden

---

## 🎯 Future Enhancements

1. **Set Default Address** - Mark one address as default for checkout
2. **Address Labels** - "Home", "Office", "Other"
3. **Address Autocomplete** - Google Places API integration
4. **Delivery Type** - Home delivery, Office delivery, Pickup
5. **Address Search** - Search and filter addresses
6. **Address History** - View previously used addresses
7. **Bulk Operations** - Select and delete multiple addresses

---

## 🐛 Troubleshooting

### Issue: "Authentication required" error
**Solution:**
- Ensure user is logged in
- Check token is valid and not expired
- Verify Authorization header format: `Bearer <TOKEN>`

### Issue: Address not showing
**Solution:**
- Ensure delivery_addresses table is created
- Check database connection
- Verify table has proper indexes
- Check user_id foreign key

### Issue: Form validation errors
**Solution:**
- Phone: Use format like +91 9876543210
- Postal Code: 3-10 alphanumeric characters
- Email: Valid email format if provided
- All required fields must be filled

### Issue: Delete confirmation not appearing
**Solution:**
- Check browser console for JavaScript errors
- Ensure browser supports window.confirm()

---

## 📊 Component Hierarchy

```
App.tsx
└── Profile.tsx
    ├── Sidebar Navigation
    │   ├── User Info
    │   └── Menu Items
    └── Content Area
        ├── AccountSection (when active)
        ├── OrdersSection (when active)
        ├── SavedAddresses (when active) ← Current
        │   ├── AddressCard
        │   │   ├── Address Details
        │   │   └── Action Buttons
        │   └── AddAddressModal
        │       └── AddressForm
        └── SettingsSection (when active)
```

---

## 🎊 Summary

You now have a complete **Saved Addresses management system** with:

✅ Full CRUD operations
✅ User authentication & security
✅ Responsive design
✅ Clean UI similar to Amazon/Flipkart
✅ Form validation
✅ Error handling
✅ Loading states
✅ Empty states
✅ Confirmation dialogs

Ready for production deployment!
