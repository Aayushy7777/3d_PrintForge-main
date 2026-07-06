# PrintForge Address System - Visual Workflow

## 🔄 How It All Works Together

### Request Flow for "Add New Address"

```
USER CLICKS "Add Address" Button
           ↓
   [AddAddressModal Opens]
   (Component: src/components/profile/AddAddressModal.tsx)
           ↓
   USER FILLS FORM & CLICKS "Add Address"
           ↓
   ├─ Frontend validates with Zod schema ✓
   ├─ Calls getToken() from Firebase AuthContext
   │  └─ Returns: Firebase ID Token (sub claim = user_id)
   ├─ Sends POST to /api/users/addresses
   │  Headers: Authorization: Bearer {token}
   │  Body: {full_name, phone_number, email, ...}
           ↓
   [Vite Dev Server Proxy]
   Routes /api/* → http://localhost:5000
           ↓
   [Express Backend - port 5000]
   Route: server/routes/users.js → POST /addresses
           ↓
   ├─ Middleware: verifyToken
   │  └─ Decodes Firebase token
   │  └─ Extracts userId from token.sub
   ├─ Validates address with addressValidation.js ✓
   ├─ Sanitizes inputs (trim, truncate) ✓
   ├─ Sets user_id = authenticated user
           ↓
   [Supabase PostgreSQL]
   INSERT delivery_addresses record
           ↓
   ✅ SUCCESS RESPONSE (status 201)
   {id: "uuid", user_id: "...", full_name: "...", ...}
           ↓
   [SavedAddresses Component]
   ├─ Re-fetches address list
   ├─ Updates UI with new address
   ├─ Shows toast: "Address added successfully"
   ├─ Closes modal
   ├─ Address now visible in grid
```

---

## 📊 Component Communication

```
Profile.tsx (Main Container)
├── Sidebar Navigation (Account/Orders/Addresses/Settings)
│   └─ When "Addresses" clicked → Shows SavedAddresses
│
└─ SavedAddresses Component
   ├─ Initial Load: Calls GET /api/users/addresses
   ├─ Fetches all addresses (List)
   │
   ├─ "Add New Address" Button
   │  └─ Opens: AddAddressModal
   │
   ├─ Address Cards (Grid)
   │  ├─ Each card shows one address
   │  ├─ Edit Button → Opens AddAddressModal (with pre-filled data)
   │  └─ Delete Button → DELETE /api/users/addresses/:id
   │
   └─ AddAddressModal Component
      ├─ Uses React Hook Form + Zod validation
      ├─ Gets token from useAuth hook
      ├─ POST or PUT depending on add/edit
      ├─ Shows loading state while submitting
      ├─ Displays errors if validation fails
      └─ Calls onSaved() callback on success
```

---

## 🗄️ Database Schema

### delivery_addresses Table

```
┌─────────────────────────────────────┐
│      delivery_addresses             │
├─────────────────────────────────────┤
│ id (UUID) [PRIMARY KEY]             │
│ user_id (UUID) [FOREIGN KEY → users]│ ← Links to logged-in user
│─────────────────────────────────────│
│ full_name (VARCHAR 100)             │
│ phone_number (VARCHAR 20)           │
│ email (VARCHAR 100, NULLABLE)       │
│ house_number (VARCHAR 50)           │
│ street (VARCHAR 100)                │
│ city (VARCHAR 50)                   │
│ state (VARCHAR 50)                  │
│ postal_code (VARCHAR 20)            │
│ country (VARCHAR 50)                │
│ delivery_instructions (TEXT)        │
│─────────────────────────────────────│
│ created_at (TIMESTAMP)              │
│ updated_at (TIMESTAMP)              │
└─────────────────────────────────────┘

INDEX: idx_delivery_addresses_user_id
       Speeds up queries for user's addresses
```

---

## 🔐 Authentication & Security

### Token Flow

```
Frontend (React + Supabase)
├─ User clicks "Login"
├─ Supabase auth dialog/form (email/password or OAuth)
├─ User authenticates
├─ Supabase issues Access Token (JWT)
│  {
│    sub: "user_uuid_123",  ← This is the user_id!
│    email: "user@example.com",
│    role: "authenticated",
│    iat: 1234567890,
│    exp: 1234571490
│  }
├─ Supabase SDK stores session (automatically)
├─ When making API calls, session.access_token is used
└─ Sends with: Authorization: Bearer {token}
             ↓
Backend (Express + Supabase Auth Middleware)
├─ Receives request
├─ Extracts token from Authorization header
├─ Verifies token via supabase.auth.getUser(token)
├─ Gets userId from: user.id
├─ Associates data with userId
└─ Only user can access/modify their own data
```

---

## ✅ Data Validation Layers

### Frontend (Client-side)
```javascript
// src/components/profile/AddAddressModal.tsx
const addressSchema = z.object({
  full_name: z.string().min(2),
  phone_number: z.string().regex(/^[+]?...$/),  // International format
  email: z.string().email().optional(),
  house_number: z.string().min(1),
  street: z.string().min(3),
  city: z.string().min(2),
  state: z.string().min(2),
  postal_code: z.string().regex(/^[A-Za-z0-9\s\-]{3,10}$/),
  country: z.string().min(2),
  delivery_instructions: z.string().max(500).optional(),
});
```

### Backend (Server-side)
```javascript
// server/lib/addressValidation.js
validateAddress(data) {
  // Phone regex: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?...$/
  // Email regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  // PostalCode regex: /^[A-Za-z0-9\s\-]{3,10}$/
  // Returns: {isValid, errors}
}

sanitizeAddress(data) {
  // trim all strings
  // substring limits (max lengths)
  // lowercase email
  // Returns cleaned data
}
```

### Database (SQL constraints)
```sql
-- NOT NULL constraints on required fields
-- VARCHAR length limits
-- FOREIGN KEY to users table
-- UUID default for id
-- Timestamp defaults for created_at/updated_at
```

---

## 🚀 API Endpoints Summary

### Address Management

| Method | Endpoint | Purpose | Auth | Response |
|--------|----------|---------|------|----------|
| GET | `/api/users/addresses` | List user's addresses | Required | `[{...}, {...}]` |
| POST | `/api/users/addresses` | Create address | Required | `{id, ...}` 201 |
| PUT | `/api/users/addresses/:id` | Update address | Required | `{id, ...}` 200 |
| DELETE | `/api/users/addresses/:id` | Delete address | Required | `{message}` 200 |

### Response Examples

**Create Success (201)**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "user_uid_123",
  "full_name": "John Doe",
  "phone_number": "+91 9876543210",
  "email": "john@example.com",
  "house_number": "123",
  "street": "Main Street",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "country": "United States",
  "delivery_instructions": "Leave at front door",
  "created_at": "2024-03-13T10:30:45.123Z",
  "updated_at": "2024-03-13T10:30:45.123Z"
}
```

**Validation Error (400)**
```json
{
  "error": "Invalid address data",
  "errors": {
    "phone_number": "Invalid phone number format",
    "postal_code": "Invalid postal code format"
  }
}
```

**Auth Error (401)**
```json
{
  "error": "Missing authorization"
}
```

---

## ⚙️ Configuration Files

### Frontend (Vite)
```javascript
// vite.config.ts
server: {
  port: 8080,
  proxy: {
    "/api": {
      target: "http://localhost:5000",
      changeOrigin: true,
    }
  }
}
```
→ Means: Dev server routes /api calls to backend on port 5000

### Backend (Express)
```javascript
// server/index.js
app.use('/api/users', usersRouter);
```
→ Means: All /api/users/* requests handled by users.js router

---

## 🧪 Testing Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 8080
- [ ] User logged in (Supabase auth)
- [ ] delivery_addresses table exists in Supabase
- [ ] Can see "Saved Addresses" tab on /profile
- [ ] Can click "Add New Address" button
- [ ] Modal opens with form
- [ ] All form fields visible
- [ ] Form validation works (try invalid email)
- [ ] Can fill form and click "Add Address"
- [ ] Toast appears: "Address added successfully"
- [ ] Address appears in grid
- [ ] Can edit address (form pre-fills)
- [ ] Can delete address (with confirmation)
- [ ] Console has no red errors
- [ ] Network tab shows 201 response for POST

---

## 📱 Responsive Design

| Screen Size | Layout |
|-------------|--------|
| Mobile | Single column, stacked cards |
| Tablet (768px) | 2 columns |
| Desktop | Sidebar + 2-3 column grid |

---

## 🎨 UI Components Used

- `Profile` - Main page layout
- `SavedAddresses` - Address list container
- `AddAddressModal` - Form dialog (Add/Edit)
- `AddressCard` - Individual address display
- `Form`, `FormField`, `FormItem`, etc. - shadcn/ui form components
- `Button`, `Input`, `Select`, `Textarea` - shadcn/ui form inputs
- `Dialog`, `DialogContent`, `DialogHeader` - shadcn/ui dialog
- `Skeleton` - Loading placeholder
- `Avatar`, `AvatarFallback` - User profile picture
- `Dropdown Menu` - User options in navbar

---

## 🔗 File Dependencies

```
Profile.tsx
├── useAuth (context)
├── useNavigate (react-router)
├── SavedAddresses component
│   ├── useAuth (get token)
│   ├── useToast (notifications)
│   ├── AddressCard component
│   │   └── Uses address data
│   └── AddAddressModal component
│       ├── useAuth (get token)
│       ├── useToast (notifications)
│       ├── useForm + zodResolver (validation)
│       └── All form UI components
├── Navbar component
└── Footer component
```

---

**This covers the complete architecture and workflow! 🎉**
