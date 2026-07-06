# Supabase Auth Setup Guide

## Quick Start

### 1. Ensure Backend `.env` is Configured

Check `/server/.env` has these variables:

```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
FIREBASE_PROJECT_ID=your_project (optional)
FIREBASE_PRIVATE_KEY=your_key (optional)
```

**Where to get these**:
- Go to [supabase.com](https://supabase.com)
- Open your project
- Settings → API
- Copy `Project URL` → `SUPABASE_URL`
- Copy `Service role secret` → `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET` can be any random string (used for token signing)

### 2. Start Backend

```bash
cd server
npm install  # if not done
npm run dev

# Should show: "Server listening on port 5000"
```

### 3. Start Frontend

```bash
# In project root (another terminal)
npm install  # if not done
npm run dev

# Should show: "http://localhost:8080" (or similar)
```

### 4. Test Registration

1. Go to http://localhost:8080/login
2. Click "Sign up" (or similar)
3. Enter:
   - Email: `test@example.com`
   - Password: `password123`
   - Name: `Test User`
4. Click "Sign up"

**Expected**:
- User created in Supabase `users` table
- Token stored in localStorage
- Redirected to home page
- Avatar visible in navbar

### 5. Test Login

1. Click logout (if logged in)
2. Go to http://localhost:8080/login
3. Enter email/password
4. Click "Sign in"

**Expected**:
- Logged in successfully
- User info displayed

### 6. Test Addresses

1. Click your avatar → "Saved Addresses"
2. Click "Add New Address"
3. Fill in the form:
   ```
   Full Name: Test User
   Phone: +91 9876543210
   House: 123
   Street: Test Street
   City: Mumbai
   State: MH
   Postal Code: 400001
   Country: India
   ```
4. Click "Add Address"

**Expected**:
- Green toast: "Address added successfully"
- Address appears in list
- Can edit/delete it

---

## Verify Everything Works

### Backend API Test

```bash
# Test: Create token
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test2@example.com","password":"pass123","name":"Test"}'

# You should get back: {"token":"eyJ...","user":{...}}
```

### Frontend Session Persistence Test

1. Login to http://localhost:8080/login
2. Hard refresh page (Ctrl+F5 or Cmd+Shift+R)
3. **Expected**: Still logged in (token loaded from localStorage)

### Saved Addresses Test

1. Go to http://localhost:8080/profile
2. Click "Saved Addresses" tab
3. Add an address (see Test Addresses above)
4. Hard refresh page
5. **Expected**: Address still there (fetched from Supabase)

---

## Token in localStorage

### View Your Token

1. Open browser DevTools (F12)
2. Go to **Application** tab
3. Click **localStorage**
4. Look for `auth_token`
5. Click it to see the full token

**Token Format**: `eyJhbGciOiJIUzI1NiIs...` (three parts separated by dots)

### Decode Token (For Debugging)

1. Go to https://jwt.io/
2. Past your token in the "Encoded" box
3. You'll see:
   ```json
   {
     "id": "your-user-uuid",
     "email": "your@email.com"
   }
   ```

---

## Common Issues & Solutions

### Issue: Empty Profile

**Symptom**: Profile page shows no user info

**Causes**:
1. Not logged in - Login first
2. page.tsx has different redirect logic - Check your routing

**Solution**:
- Make sure you're logged in (see avatar)
- Check browser console for errors (F12 → Console)

### Issue: Can't Add Address

**Symptom**: Click "Add Address" but nothing happens or error appears

**Causes**:
1. Not logged in - Token not sent
2. `delivery_addresses` table not created in Supabase
3. Backend not running
4. Invalid token

**Solution**:
- Make sure logged in
- Create table: Go to Supabase → SQL Editor → Run SQL from SETUP_AND_API_EXAMPLES.md
- Check backend running: `npm run dev` in /server
- Check browser console (F12 → Console) for exact error

### Issue: Login/Register Fails

**Symptom**: Shows error when trying to login/register

**Causes**:
1. Backend not running
2. SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing
3. Network error

**Solution**:
- Check backend is running: `npm run dev` in /server
- Check .env file in /server has SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
- Check terminal for error messages

---

## What Changed from Firebase

| What | Firebase | Supabase Auth |
|------|----------|---------------|
| **How Auth Works** | Firebase SDK in browser | Backend REST API calls |
| **Token Storage** | Firebase SDK handles | localStorage with key `auth_token` |
| **Token Type** | Firebase ID Token | JWT with `id` claim |
| **Session Persistence** | Firebase SDK auto-handles | Manual: validate on app mount |
| **No of Dependencies** | Large Firebase SDK | No external SDK needed |
| **Configuration** | `.env` with Firebase keys | `.env` with Supabase & JWT_SECRET |

---

## File Structure

```
printflow-studio/
├── .env                           ← VITE_API_URL=http://localhost:5000
├── server/
│   ├── .env                       ← SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET
│   ├── routes/
│   │   ├── auth.js               ← /api/auth/register, /api/auth/login, /api/auth/me
│   │   ├── users.js              ← /api/users/addresses (uses token.id)
│   │   └── orders.js             ← /api/orders/* (uses token.id)
│   └── lib/
│       └── supabase.js           ← Supabase client initialization
└── src/
    ├── contexts/
    │   └── AuthContext.tsx        ← Manages login/register/logout + token storage
    └── pages/
        ├── Profile.tsx           ← Profile page (uses user from AuthContext)
        └── Cart.tsx              ← Checkout with address collection
```

---

## Backend Auth Endpoints

### POST /api/auth/register
Create a new user account

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe"
}
```

**Response (201)**:
```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### POST /api/auth/login
Authenticate and get token

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response (200)**:
```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### GET /api/auth/me
Get current user info (requires valid token)

**Headers**:
```
Authorization: Bearer {token}
```

**Response (200)**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Error (401)**: Token invalid or missing

---

## Production Deployment Notes

When deploying to production:

1. ✅ Remove Firebase SDK references (already done)
2. ✅ Use HTTPS only (don't send tokens over HTTP)
3. ✅ Set `JWT_SECRET` to a strong random string
4. ✅ Never commit `.env` files with real secrets
5. ✅ Use environment variable service (deploy platform) for secrets
6. ✅ Consider adding: token refresh mechanism (optional)
7. ✅ Consider adding: password reset flow (optional)

---

## Getting Help

If something doesn't work:

1. Check `/server` terminal for error messages
2. Check browser console (F12 → Console) for errors
3. Check network requests (F12 → Network tab)
4. See FIREBASE_TO_SUPABASE_MIGRATION.md for technical details
5. See VERIFY_SETUP.md for comprehensive diagnostic steps

---

**Ready to use! 🚀**
