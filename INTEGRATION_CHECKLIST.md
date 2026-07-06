# Integration Checklist - PrintForge Studio

This document helps you verify that backend, frontend, and database are properly integrated.

## Prerequisites

1. **Node.js** installed (v18+)
2. **Supabase account** and project created
3. **npm** or **yarn** package manager

---

## Step 1: Database Setup (Supabase)

### 1.1 Create Supabase Project
- Go to [supabase.com](https://supabase.com)
- Create a new project
- Wait for database to be provisioned (~2 minutes)

### 1.2 Run Database Schema
- In Supabase Dashboard → **SQL Editor**
- Copy contents of `server/supabase/schema.sql`
- Paste and **Run** the SQL script
- Verify tables created: `users`, `products`, `orders`

### 1.3 Get API Credentials
- In Supabase Dashboard → **Project Settings** → **API**
- Copy:
  - **Project URL** (SUPABASE_URL)
  - **service_role** key (SUPABASE_SERVICE_ROLE_KEY) ⚠️ Keep this secret!

---

## Step 2: Backend Setup

### 2.1 Install Dependencies
```bash
cd server
npm install
```

### 2.2 Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your values:
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# JWT_SECRET=your-long-random-secret-string
```

### 2.3 Test Database Connection
```bash
npm run test
```

Expected output:
```
✅ SUPABASE_URL: https://...
✅ SUPABASE_SERVICE_ROLE_KEY: ***
✅ JWT_SECRET: ***
✅ Users table accessible
✅ Products table accessible
✅ Orders table accessible
🎉 All tests passed!
```

### 2.4 Seed Products (Optional)
```bash
npm run seed
```

### 2.5 Start Backend Server
```bash
npm run dev
```

Expected output:
```
Server listening on port 5000
```

**Test backend:**
- Open browser: `http://localhost:5000`
- Should see: `{"status":"ok","message":"PrintForge backend (Express + Supabase)"}`
- Test products: `http://localhost:5000/api/products`

---

## Step 3: Frontend Setup

### 3.1 Install Dependencies
```bash
# From project root
npm install
```

### 3.2 Start Frontend Dev Server
```bash
npm run dev
```

Expected output:
```
VITE v6.x.x  ready in xxx ms

➜  Local:   http://localhost:8080/
➜  Network: use --host to expose
```

### 3.3 Verify Frontend-Backend Integration

1. **Open browser:** `http://localhost:8080`
2. **Check products load:**
   - Navigate to `/products`
   - Products should load from backend API
   - If empty, run `cd server && npm run seed`

3. **Test authentication:**
   - Click "Sign in" in top-right navbar
   - Create account or login
   - Should redirect and show user avatar in navbar

4. **Test API proxy:**
   - Open browser DevTools → Network tab
   - Navigate to `/products`
   - Check that `/api/products` requests go to `localhost:5000`

---

## Step 4: Integration Verification

### ✅ Backend Checks

- [ ] Backend starts without errors
- [ ] Database connection successful (`npm run test`)
- [ ] Products API returns data: `GET http://localhost:5000/api/products`
- [ ] Auth endpoints work: `POST http://localhost:5000/api/auth/register`
- [ ] Static assets served: `http://localhost:5000/assets/product-vase.jpg`

### ✅ Frontend Checks

- [ ] Frontend starts without errors
- [ ] Products page loads products from API
- [ ] Product detail page works
- [ ] Login page accessible at `/login`
- [ ] Navbar shows "Sign in" when logged out
- [ ] Navbar shows user avatar when logged in
- [ ] Cart functionality works
- [ ] No console errors in browser DevTools

### ✅ Database Checks

- [ ] Tables exist: `users`, `products`, `orders`
- [ ] Products table has data (if seeded)
- [ ] Can create users via API
- [ ] Can query products via API

---

## Troubleshooting

### Backend won't start
- Check `.env` file exists and has all required variables
- Verify Supabase credentials are correct
- Check port 5000 is not in use

### Database connection fails
- Verify Supabase project is active
- Check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`
- Run `npm run test` to see detailed error

### Frontend can't reach backend
- Ensure backend is running on port 5000
- Check Vite proxy config in `vite.config.ts`
- Verify frontend is on port 8080 (default)
- Check browser console for CORS errors

### Products not loading
- Run `cd server && npm run seed`
- Check backend logs for errors
- Verify products table has data in Supabase dashboard
- Check browser Network tab for API errors

### Authentication not working
- Verify JWT_SECRET is set in backend `.env`
- Check browser localStorage for `token` key
- Verify `/api/auth/me` endpoint works
- Check backend logs for auth errors

---

## Quick Test Commands

```bash
# Test backend database connection
cd server && npm run test

# Seed products
cd server && npm run seed

# Start backend (in server folder)
cd server && npm run dev

# Start frontend (in root folder)
npm run dev

# Build frontend for production
npm run build
```

---

## API Endpoints Reference

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires Bearer token)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order by ID

---

## Next Steps

Once integration is verified:
1. ✅ Customize products in Supabase dashboard
2. ✅ Add more product data via seed script
3. ✅ Configure production environment variables
4. ✅ Set up CI/CD if needed
5. ✅ Deploy backend and frontend

---

**Need help?** Check:
- Backend logs: `cd server && npm run dev`
- Frontend console: Browser DevTools
- Database: Supabase Dashboard → Table Editor
