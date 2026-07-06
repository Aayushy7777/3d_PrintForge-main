# Quick Start Guide - PrintForge Studio

## 🚀 Get Running in 5 Minutes

### 1. Database Setup (Supabase)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to **SQL Editor** → Run `server/supabase/schema.sql`
4. Go to **Settings** → **API** → Copy:
   - Project URL → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run test    # Verify connection
npm run seed    # Add sample products
npm run dev     # Start backend (port 5000)
```

### 3. Frontend Setup

```bash
# From project root
npm install
npm run dev     # Start frontend (port 8080)
```

### 4. Verify

- ✅ Backend: http://localhost:5000 → Should show JSON status
- ✅ Frontend: http://localhost:8080 → Should show homepage
- ✅ Products: http://localhost:8080/products → Should list products
- ✅ Login: http://localhost:8080/login → Should show login form

---

## 📋 Integration Checklist

Run these checks to verify everything works:

### Backend Tests
```bash
cd server
npm run test
```

### Manual Checks

1. **Backend API**
   - Open: http://localhost:5000/api/products
   - Should return JSON array of products

2. **Frontend → Backend**
   - Open: http://localhost:8080/products
   - Products should load from API
   - Check browser DevTools → Network → Should see `/api/products` requests

3. **Authentication**
   - Click "Sign in" in navbar
   - Create account
   - Should see avatar in navbar after login

4. **Database**
   - Supabase Dashboard → Table Editor
   - Verify `products` table has data
   - Verify `users` table (after registering)

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't start | Check `.env` file exists with all variables |
| Database connection fails | Verify Supabase credentials in `.env` |
| Products not loading | Run `cd server && npm run seed` |
| Frontend can't reach backend | Ensure backend is running on port 5000 |
| Auth not working | Check JWT_SECRET is set in backend `.env` |

---

## 📚 Full Documentation

See `INTEGRATION_CHECKLIST.md` for detailed setup instructions.

---

**Ready to go!** 🎉
