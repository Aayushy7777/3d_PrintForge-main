# Phase 2: Backend Implementation - Complete Setup Guide

## Overview
Phase 2 focuses on setting up the complete backend infrastructure with Prisma ORM, database migrations, repositories, and API routes. This guide walks through every step needed to get the backend operational.

## Prerequisites Checklist
- ✅ Node.js 20 LTS installed
- ✅ npm or yarn package manager
- ✅ Supabase project created and accessible
- ✅ .env files configured with API keys
- ✅ Two terminal windows (one for frontend, one for backend)

---

## Step 1: Install Dependencies

### Install Prisma and Backend Packages

```bash
cd server
npm install
```

This will install:
- `@prisma/client` - Prisma client for database queries
- `prisma` - Prisma CLI for migrations and schema management
- `bcryptjs` - Password hashing
- `uuid` - ID generation
- Plus all existing dependencies

**Verify installation:**
```bash
npx prisma --version
```

Expected output: `Prisma CLI X.X.X`

---

## Step 2: Configure Database Connection

### Get Your Supabase Connection String

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **Settings** → **Database**
4. Copy the **Connection String** (PostgreSQL tab)
5. Ensure you select the option: "Use connection pooling"

### Update Environment Variables

Edit `prisma/.env`:

```env
# Copy from Supabase Dashboard
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.XXXXX.supabase.co:5432/postgres"

# Add this for local development (matches server/.env)
NODE_ENV=development
```

**Important:** 
- Replace `YOUR_PASSWORD` with your Supabase database password
- Replace `XXXXX` with your project reference
- Don't commit `.env` files to git

---

## Step 3: Run Database Migrations

### Create Initial Migration

```bash
cd server
npx prisma migrate dev --name init
```

This command:
1. Creates the migration directory
2. Generates SQL from `schema.prisma`
3. Applies migration to your Supabase database
4. Generates Prisma client

**Expected output:**
```
✔ Successfully created and applied migration init
✔ Generated Prisma Client
```

---

## Step 4: Seed Sample Data

### Populate Database with Test Data

```bash
npm run seed
```

This securely:
- Creates 4 product categories (Sculptures, Tech Parts, Prototypes, Custom)
- Adds 4 sample products with real pricing
- Creates test users with hashed passwords
- Sets up delivery addresses

**Test Credentials Created:**
```
Admin:    admin@printforge.com / admin@123
Customer: customer@example.com / customer@123
```

**Expected output:**
```
🌱 Starting database seed...
✅ Categories created
✅ Products created
✅ Users created
✅ Delivery addresses created
✨ Seed completed successfully!
```

---

## Step 5: Start Backend Server

### Run Development Server

In your backend terminal:

```bash
npm run dev
```

Expected output:
```
🚀 Server running on http://localhost:5001
📊 API Documentation: POST /api/docs
```

### Verify Backend is Running

In another terminal:

```bash
curl http://localhost:5001/health
# or
curl -w "\n" http://localhost:5001/api/products
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Step 6: Key Endpoints Available

### Products API
```bash
# Get all products
curl http://localhost:5001/api/products

# Get featured products
curl http://localhost:5001/api/products/featured

# Get product by slug
curl http://localhost:5001/api/products/dragon-figurine

# Search products
curl http://localhost:5001/api/products/search?q=dragon
```

### Authentication API
```bash
# Register new user
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "secure123",
    "name": "New User"
  }'

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "customer@123"
  }'
```

### Cart API
```bash
# Get user cart
curl http://localhost:5001/api/cart \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Add to cart
curl -X POST http://localhost:5001/api/cart \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PRODUCT_ID",
    "quantity": 1
  }'
```

---

## Step 7: Verify Database Setup

### View Database in Prisma Studio

```bash
npx prisma studio
```

This opens an interactive UI at `http://localhost:5555` where you can:
- View all database tables
- Browse records
- Create/edit/delete data
- Test queries visually

---

## Project Structure

```
server/
├── index.js                          # Server entry point
├── lib/
│   └── prisma.js                    # Prisma client singleton
├── prisma/
│   ├── schema.prisma                # Database schema definition
│   ├── .env                         # DATABASE_URL
│   ├── migrations/                  # Auto-generated migrations
│   └── seed.js                      # Database seeding
├── repositories/                    # Data access layer
│   ├── UserRepository.js
│   ├── ProductRepository.js
│   ├── OrderRepository.js
│   ├── PaymentRepository.js
│   └── CartRepository.js
├── routes/                          # API route definitions
│   ├── products.js
│   ├── auth.js
│   ├── cart.js
│   └── orders.js
├── middleware/
│   ├── authMiddleware.js            # JWT authentication
│   └── errorMiddleware.js           # Error handling
└── services/                        # Business logic
    ├── emailService.js
    └── paymentService.js
```

---

## Common Issues & Solutions

### ❌ "PrismaClientInitializationError"
**Cause:** DATABASE_URL not set or invalid  
**Solution:**
```bash
# Verify .env file exists and has DATABASE_URL
cat prisma/.env

# Re-check Supabase connection string
```

### ❌ "Error: connect ECONNREFUSED"
**Cause:** Database connection failed  
**Solution:**
```bash
# Verify database is running in Supabase
# Test connection directly using psql (if installed)
psql "postgresql://..."
```

### ❌ "Migration failed"
**Cause:** Schema conflicts or database locked  
**Solution:**
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or skip safety check
npx prisma migrate deploy
```

### ❌ "Port 5001 already in use"
**Cause:** Another process using the port  
**Solution:**
```bash
# Windows: Kill process on port 5001
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# macOS/Linux: Kill process on port 5001
lsof -ti:5001 | xargs kill -9
```

---

## Database Schema Overview

### Core Models (11 Total)

1. **User** - Authentication & profiles
   - Roles: ADMIN, CUSTOMER
   - Fields: email, password, name, phone, role

2. **Category** - Product categories
   - Fields: name, slug, description, icon
   - 4 pre-loaded categories

3. **Product** - 3D printable products
   - Linked to Category
   - Fields: name, price, costPrice, materials, colors, stock
   - 4 sample products included

4. **CartItem** - Shopping cart items
   - Links User + Product
   - Unique constraint: One item per user per product
   - Auto-updated quantity on re-add

5. **Order** - Purchase orders
   - Linked to User, includes OrderItems
   - Status: PENDING → PROCESSING → SHIPPED → DELIVERED
   - Auto-generated order number

6. **OrderItem** - Order line items
   - Links Order + Product
   - Stores product snapshot (name, price at purchase)

7. **Payment** - Payment records
   - Razorpay integration
   - Statuses: PENDING, SUCCESS, FAILED, REFUNDED
   - Stores signatures for verification

8. **DeliveryAddress** - Shipping addresses
   - Linked to User
   - Can mark one as default
   - Full address fields included

9. **Review** - Product reviews
   - Linked to Product + User
   - Rating (1-5 stars)
   - Text reviews with timestamps

10. **Notification** - Email notifications
    - Linked to Order + User
    - Types: ORDER_CONFIRMATION, SHIPMENT, DELIVERY
    - Tracks sent status

11. **AdminLog** - Audit trail
    - Linked to Admin User
    - Logs all admin actions
    - Timestamps and action descriptions

---

## Next Steps (Phase 2 Continued)

After completing this setup:

1. ✅ **Database Foundation** (THIS GUIDE) - COMPLETE
2. ⏳ **API Routes Implementation** - Create all 15+ endpoints
3. ⏳ **Email Service** - Nodemailer integration with OAuth
4. ⏳ **Payment Integration** - Razorpay webhook handling
5. ⏳ **Authentication Middleware** - JWT verification
6. ⏳ **Admin Routes** - Analytics and admin operations
7. ⏳ **API Documentation** - Swagger/OpenAPI specs
8. ⏳ **Testing** - Integration tests for all routes

---

## Database Backup & Reset

### Backup Current Database

```bash
# Using Supabase CLI
supabase db dump > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Reset to Fresh State

```bash
# WARNING: This deletes all data!
npx prisma migrate reset

# Or use Supabase dashboard to drop all tables manually
```

---

## Performance Optimization

### Create Indexes for Common Queries

Indexes are already included in schema:
- `User.email` - for login queries
- `Product.slug` - for detail page lookups
- `Order.userId + createdAt` - for user order history
- `Payment.razorpayPaymentId` - for payment verification

---

## Security Best Practices

✅ Implemented:
- Password hashing with bcryptjs
- Environment variables for secrets
- Unique constraints on email
- Data models with proper relationships

Next Phase:
- JWT token validation middleware
- Rate limiting on auth endpoints
- CORS configuration
- Database connection pooling
- SQL injection prevention via Prisma

---

## Support & Documentation

- **Prisma Docs:** https://www.prisma.io/docs
- **Supabase Docs:** https://supabase.com/docs
- **PostgreSQL Docs:** https://www.postgresql.org/docs

---

## Checklist for Phase 2 Completion

- [ ] Dependencies installed (`npm install`)
- [ ] DATABASE_URL configured in `prisma/.env`
- [ ] Initial migration created (`npx prisma migrate dev`)
- [ ] Seed data populated (`npm run seed`)
- [ ] Backend server running on port 5001
- [ ] Products API responding (GET /api/products)
- [ ] Test users created (admin + customer accounts)
- [ ] Prisma Studio accessible and functional
- [ ] Database backup procedure documented
- [ ] All endpoints tested with curl or Postman

---

**Status:** Phase 2 Foundation Ready ✅  
**Next:** API Routes Implementation
