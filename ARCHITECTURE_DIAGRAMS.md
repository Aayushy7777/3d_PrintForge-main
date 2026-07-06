# System Architecture & Visual Diagrams

## Complete System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐        │
│  │           React Frontend Application                 │        │
│  ├──────────────────────────────────────────────────────┤        │
│  │                                                       │        │
│  │  📄 Pages:                                           │        │
│  │  ├─ Cart.tsx (MODIFIED)                             │        │
│  │  │  └─ Checkout button handler                      │        │
│  │  │     └─ Check JWT token                           │        │
│  │  │        └─ Open AddressDialog                     │        │
│  │  │                                                   │        │
│  │  📦 Components:                                      │        │
│  │  ├─ AddressDialog.tsx (NEW)                         │        │
│  │  │  └─ Modal wrapper                                │        │
│  │  │     └─ Manages open/close                        │        │
│  │  │                                                   │        │
│  │  ├─ AddressForm.tsx (NEW)                           │        │
│  │  │  ├─ 10 form fields                               │        │
│  │  │  ├─ Zod validation                               │        │
│  │  │  └─ Submit handler                               │        │
│  │  │                                                   │        │
│  │  🔐 localStorage:                                   │        │
│  │  └─ auth_token (JWT)                                │        │
│  │                                                       │        │
│  └──────────────────────────────────────────────────────┘        │
│                           ▲                                       │
│                           │ HTTP/HTTPS                            │
│                           ▼                                       │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ API Requests
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXPRESS.JS BACKEND                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐        │
│  │              Route: /api/orders                      │        │
│  │                                                       │        │
│  │  ┌─────────────────────────────────────────────┐    │        │
│  │  │ POST /api/orders/address (NEW)              │    │        │
│  │  │ ─────────────────────────────────────────   │    │        │
│  │  │ ├─ JWT Verification Middleware              │    │        │
│  │  │ ├─ addressValidation.validateAddress()      │    │        │
│  │  │ │  ├─ Phone validation                      │    │        │
│  │  │ │  ├─ Email validation                      │    │        │
│  │  │ │  ├─ Postal code validation                │    │        │
│  │  │ │  └─ Required fields check                 │    │        │
│  │  │ ├─ addressValidation.sanitizeAddress()      │    │        │
│  │  │ │  ├─ Trim whitespace                       │    │        │
│  │  │ │  ├─ Limit string lengths                  │    │        │
│  │  │ │  └─ Lowercase email                       │    │        │
│  │  │ └─ Supabase INSERT to delivery_addresses    │    │        │
│  │  └─────────────────────────────────────────────┘    │        │
│  │                                                       │        │
│  │  ┌─────────────────────────────────────────────┐    │        │
│  │  │ POST /api/orders (MODIFIED)                 │    │        │
│  │  │ ─────────────────────────────────────────   │    │        │
│  │  │ ├─ Accept delivery_address_id               │    │        │
│  │  │ ├─ Validate items array                     │    │        │
│  │  │ └─ Supabase INSERT to orders               │    │        │
│  │  │    └─ With delivery_address_id reference   │    │        │
│  │  └─────────────────────────────────────────────┘    │        │
│  │                                                       │        │
│  └──────────────────────────────────────────────────────┘        │
│                           ▲                                       │
│                           │ Supabase SDK                          │
│                           ▼                                       │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ PostgreSQL Queries
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐        │
│  │                TABLES                                │        │
│  │                                                       │        │
│  │  📋 users                                            │        │
│  │  ├─ id (PK)                                          │        │
│  │  ├─ email                                            │        │
│  │  ├─ name                                             │        │
│  │  └─ password_hash                                    │        │
│  │                                                       │        │
│  │  📍 delivery_addresses (NEW)                         │        │
│  │  ├─ id (PK)                                          │        │
│  │  ├─ user_id (FK)                                     │        │
│  │  ├─ full_name                                        │        │
│  │  ├─ phone_number                                     │        │
│  │  ├─ email                                            │        │
│  │  ├─ house_number                                     │        │
│  │  ├─ street                                           │        │
│  │  ├─ city                                             │        │
│  │  ├─ state                                            │        │
│  │  ├─ postal_code                                      │        │
│  │  ├─ country                                          │        │
│  │  ├─ delivery_instructions                            │        │
│  │  ├─ created_at                                       │        │
│  │  └─ updated_at                                       │        │
│  │      └─ Indexes: user_id                             │        │
│  │                                                       │        │
│  │  🛒 orders (MODIFIED)                                │        │
│  │  ├─ id (PK)                                          │        │
│  │  ├─ items (JSON array)                               │        │
│  │  ├─ total                                            │        │
│  │  ├─ customer (JSON)                                  │        │
│  │  ├─ delivery_address_id (FK, NEW)                    │        │
│  │  ├─ status                                           │        │
│  │  ├─ created_at                                       │        │
│  │  └─ updated_at                                       │        │
│  │      └─ Indexes: delivery_address_id                 │        │
│  │                                                       │        │
│  │  📦 products                                         │        │
│  │  └─ (existing structure)                             │        │
│  │                                                       │        │
│  └──────────────────────────────────────────────────────┘        │
│                                                                   │
│  RELATIONSHIPS:                                                  │
│  ┌──────────────────────────────────────────────────────┐        │
│  │ users (1) ─── (many) delivery_addresses (1) ─── (many) orders │
│  │                                                       │        │
│  │ delivery_addresses.user_id → users.id                │        │
│  │ orders.delivery_address_id → delivery_addresses.id    │        │
│  └──────────────────────────────────────────────────────┘        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## User Journey Flow Diagram

```
START
  │
  ├─→ [Browse Products] ──→ [Add to Cart] ──→ [Go to Cart Page]
  │                                               │
  │                                               ▼
  │                                        [Shopping Cart]
  │                                               │
  │                                    [Checkout Button Click]
  │                                               │
  ├────────────────────────────────────────────────┤
  │                                                │
  │  NO                                          YES
  │  │                                            │
  │  ▼                                            ▼
  │ Logged In?                      [Open Address Dialog]
  │  │                                            │
  │  NO                                           ▼
  │  │                           [Address Form Renders]
  │  │                                            │
  │  ▼                                    ┌──────┴──────┐
  │ Toast: Login                         │               │
  │ Required                        Fill Form      Cancel
  │  │                                 │               │
  │  │                                 ▼               ▼
  │  │                          Validate Form    [Close]
  │  │                                 │          Return
  │  │                              ERROR?       to Cart
  │  │                                 │
  │  │                        NO       │       YES
  │  │                         │       │        │
  │  └───────────┐  ┌──────────┘       └──→ Show Error
  │              │  │                        Message
  │              ▼  ▼
  │     [Confirm Address Button]
  │              │
  │              ▼
  │ POST /api/orders/address (JWT)
  │              │
  │    ┌─────────┴─────────┐
  │    │                   │
  │   ERROR              SUCCESS
  │    │                   │
  │    ▼                   ▼
  │ Show Error      Get address_id
  │ Message              │
  │ (form stays          │
  │  open to retry)      │
  │                      ▼
  │            POST /api/orders
  │            (with address_id)
  │                      │
  │            ┌─────────┴─────────┐
  │            │                   │
  │           ERROR              SUCCESS
  │            │                   │
  │            ▼                   ▼
  │       Show Error        Clear Cart
  │       Toast                  │
  │                              ▼
  │                    Success Toast:
  │                  "Order Placed!"
  │                              │
  │                              ▼
  │                         [END]
  │
  └──────────────────────────────────────────→ [END]
```

## Component Hierarchy

```
App
├── Navbar
├── Pages
│   └── Cart.tsx
│       ├── [Cart Items Display]
│       ├── [Order Summary]
│       └── [Checkout Button] ◄──────┐
│                                      │
│           ┌──────────────────────────┘
│           │
│           ▼ (onClick)
│       AddressDialog (NEW)
│           │
│           ├── DialogHeader
│           │   ├── DialogTitle
│           │   └── DialogDescription
│           │
│           └── DialogContent
│               └── AddressForm (NEW)
│                   ├── FormField (full_name)
│                   ├── FormField (phone_number)
│                   ├── FormField (email)
│                   ├── FormField (house_number)
│                   ├── FormField (street)
│                   ├── FormField (city)
│                   ├── FormField (state)
│                   ├── FormField (postal_code)
│                   ├── FormField (country)
│                   ├── FormField (delivery_instructions)
│                   └── [Confirm/Cancel Buttons]
│
├── Footer
└── Toaster (for notifications)
```

## Data Flow Sequence

```
┌────────────┐           ┌──────────────┐         ┌─────────────┐
│  Frontend  │           │   Backend    │         │  Database   │
│   (React)  │           │  (Express)   │         │ (Supabase)  │
└────────────┘           └──────────────┘         └─────────────┘
      │                         │                        │
      │ 1. Click Checkout       │                        │
      │─────────────────────────►                        │
      │ (check auth token)       │                        │
      │                         │                        │
      │ 2. Open AddressDialog    │                        │
      │◄─────────────────────────│                        │
      │ (form displays)          │                        │
      │                         │                        │
      │ 3. Fill form & validate  │                        │
      │ (client-side validation) │                        │
      │                         │                        │
      │ 4. Click Confirm Address │                        │
      │─────────────────────────►                        │
      │ POST /api/orders/address │                        │
      │ (with JWT token)         │                        │
      │ body: address fields     │                        │
      │                         │                        │
      │                         │ 5. Validate address    │
      │                         │    (regex patterns)    │
      │                         │                        │
      │                         │ 6. Sanitize input      │
      │                         │    (trim, limits)      │
      │                         │                        │
      │                         │ 7. INSERT to DB        │
      │                         │───────────────────────►│
      │                         │ delivery_addresses     │
      │                         │ table                  │
      │                         │                        │
      │                         │◄───────────────────────│
      │                         │ address_id returned    │
      │                         │                        │
      │ 8. Return address_id    │                        │
      │◄─────────────────────────│                        │
      │ 200 Created              │                        │
      │ { address_id }           │                        │
      │                         │                        │
      │ 9. Create order          │                        │
      │─────────────────────────►│                        │
      │ POST /api/orders         │                        │
      │ body: items +            │                        │
      │       delivery_address_id│                        │
      │                         │                        │
      │                         │ 10. INSERT to DB       │
      │                         │───────────────────────►│
      │                         │ orders table           │
      │                         │ with address ref       │
      │                         │                        │
      │                         │◄───────────────────────│
      │                         │ order_id, status       │
      │                         │                        │
      │ 11. Return success       │                        │
      │◄─────────────────────────│                        │
      │ 201 Created              │                        │
      │ { order_id, status }     │                        │
      │                         │                        │
      │ 12. Show success toast   │                        │
      │ & clear cart             │                        │
      │                         │                        │
      └────────────┬────────────┘                        │
                   │                                     │
           [User sees success]                    [Data persisted]
```

## Form Validation Logic Flow

```
User Input
    │
    ▼
┌─────────────────────────────────────────┐
│  Frontend Form Validation (React)       │
├─────────────────────────────────────────┤
│                                         │
│  For each field:                        │
│  ├─ full_name: min 2 chars              │
│  ├─ phone_number: regex pattern         │
│  ├─ email: RFC email format (if filled) │
│  ├─ house_number: min 1 char            │
│  ├─ street: min 3 chars                 │
│  ├─ city: min 2 chars                   │
│  ├─ state: min 2 chars                  │
│  ├─ postal_code: 3-10 alphanumeric      │
│  ├─ country: non-empty                  │
│  └─ delivery_instructions: max 500 chars│
│                                         │
│  Using: Zod schema + React Hook Form    │
│                                         │
└─────────────────────────────────────────┘
    │
  ERROR? ──NO──┐
    │          │
   YES         │
    │          │
    ▼          │
Show Error     │
Message        │
(stay on form) │
    │          │
    │◄─────────┘
    │
    ▼
POST to Backend
(with valid data)
    │
    ▼
┌─────────────────────────────────────────┐
│  Backend Form Validation (Node.js)      │
├─────────────────────────────────────────┤
│                                         │
│  Using: addressValidation.js module     │
│  ├─ Verify JWT token                    │
│  ├─ Validate all fields again           │
│  │  (phone, email, postal_code regex)   │
│  ├─ Check required fields               │
│  ├─ Sanitize input strings              │
│  │  (trim, substring limits)            │
│  └─ Prevent injection attacks           │
│                                         │
└─────────────────────────────────────────┘
    │
  ERROR? ──NO──┐
    │          │
   YES         │
    │          │
    ▼          │
Return Error   │
Response       │
(400 + errors) │
    │          │
    │◄─────────┘
    │
    ▼
INSERT to Database
(parameterized query)
    │
    ▼
Return Success
+ address_id
```

## Security Layers

```
┌─────────────────────────────────────────────────────┐
│              SECURITY ARCHITECTURE                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Layer 1: AUTHENTICATION                            │
│  ├─ JWT token required in Authorization header      │
│  ├─ Token verified before processing                │
│  └─ User ID extracted from token                    │
│                                                     │
│  Layer 2: INPUT VALIDATION                          │
│  ├─ Frontend: Zod schema validation                 │
│  ├─ Backend: Regex pattern matching                 │
│  │  ├─ Phone: International format                  │
│  │  ├─ Email: RFC standard                          │
│  │  └─ Postal Code: Alphanumeric pattern            │
│  └─ No suspicious input patterns                    │
│                                                     │
│  Layer 3: DATA SANITIZATION                         │
│  ├─ Trim whitespace                                 │
│  ├─ Limit string lengths                            │
│  ├─ Convert to lowercase (email)                    │
│  └─ Remove potentially malicious characters         │
│                                                     │
│  Layer 4: SQL INJECTION PREVENTION                  │
│  ├─ Supabase parameterized queries                  │
│  ├─ No string concatenation in SQL                  │
│  └─ Database enforces type safety                   │
│                                                     │
│  Layer 5: XSS PREVENTION                            │
│  ├─ React auto-escapes output                       │
│  ├─ No dangerouslySetInnerHTML used                 │
│  └─ Trusted UI library (shadcn/ui)                  │
│                                                     │
│  Layer 6: USER DATA ISOLATION                       │
│  ├─ Addresses linked to user_id                     │
│  ├─ Users can only access own data                  │
│  └─ RLS policies on database level                  │
│                                                     │
│  Layer 7: AUDIT TRAIL                               │
│  ├─ Timestamps on all records                       │
│  ├─ User ID associated with data                    │
│  └─ Changes can be tracked                          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌──────────────────────────────────────────────────────┐
│         PRODUCTION DEPLOYMENT SETUP                  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────┐     │
│  │  CDN / Frontend Hosting (Vercel/Netlify)  │     │
│  │  ├─ React build (npm run build)           │     │
│  │  ├─ Gzipped & minified                    │     │
│  │  └─ HTTPS enabled                         │     │
│  └────────────────────────────────────────────┘     │
│                        │                            │
│                        │ API requests to           │
│                        ▼                            │
│  ┌────────────────────────────────────────────┐     │
│  │  Express.js Backend (Heroku/Railway)       │     │
│  │  ├─ PORT environment variable              │     │
│  │  ├─ CORS configured                        │     │
│  │  ├─ Environment variables loaded            │     │
│  │  │  ├─ SUPABASE_URL                        │     │
│  │  │  ├─ SUPABASE_SERVICE_ROLE_KEY           │     │
│  │  │  └─ JWT_SECRET                          │     │
│  │  └─ Request logging enabled                │     │
│  └────────────────────────────────────────────┘     │
│                        │                            │
│                        │ SQL queries               │
│                        ▼                            │
│  ┌────────────────────────────────────────────┐     │
│  │  Supabase PostgreSQL Database              │     │
│  │  ├─ Automatic backups                      │     │
│  │  ├─ Connection pooling                     │     │
│  │  ├─ Row Level Security enabled             │     │
│  │  └─ Indexes optimized                      │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
│  Environment Variables:                             │
│  ├─ Frontend (.env.production)                      │
│  │  └─ VITE_API_URL=https://api.printforge.com     │
│  │                                                  │
│  └─ Backend (.env)                                  │
│     ├─ SUPABASE_URL=https://...supabase.co        │
│     ├─ SUPABASE_SERVICE_ROLE_KEY=...              │
│     ├─ JWT_SECRET=...                              │
│     └─ NODE_ENV=production                         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

**All diagrams show the complete architecture, flow, and integration of the address collection system with your existing PrintForge application.**
