# Address Save Debugging Guide

## Step 1: Check Browser Console

1. Open your browser (Chrome, Firefox, Edge)
2. Press **F12** to open Developer Tools
3. Click the **Console** tab
4. Try to save an address again
5. **Copy and paste any error messages** you see

## Step 2: Check Network Tab

1. In Developer Tools, click the **Network** tab
2. Try to save an address again
3. Look for a request to `/api/users/addresses` (it should be RED if failed)
4. Click on that request
5. Check the **Response** tab - what error message appears?

## Step 3: Check Backend Terminal

1. Look at the terminal where your backend is running (`npm run dev` in /server)
2. **Copy any error messages** you see
3. Look for anything related to "addresses" or "401" or "403"

## Common Issues & Fixes

### Issue 1: "Invalid authorization" or "Missing authorization"
**Cause:** Token not being sent to API
**Fix:** Make sure you have a valid Firebase token. Try logging out and logging back in.

### Issue 2: "Firebase Admin SDK not configured"
**Cause:** Backend environment variables missing
**Fix:** Check `/server/.env` file has:
```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=...
```

### Issue 3: "Invalid token"
**Cause:** Token format wrong or expired
**Fix:** Try clearing browser cache and logging in again

### Issue 4: "Address not found" or database errors
**Cause:** delivery_addresses table not created
**Fix:** Run SQL in Supabase to create table (see SETUP_AND_API_EXAMPLES.md)

## Quick Check Commands

### Test if backend is running:
```bash
curl http://localhost:5000/
# Should see: {"status":"ok","message":"PrintForge backend..."}
```

### Test if users endpoint exists:
```bash
curl http://localhost:5000/api/users/addresses \
  -H "Authorization: Bearer test"
# Should see: {"error":"Invalid token format"} or similar
```

### Test with valid token:
```bash
# Get a valid Firebase token first, then:
curl http://localhost:5000/api/users/addresses \
  -H "Authorization: Bearer YOUR_REAL_TOKEN"
# Should work or show auth error
```

## What to Send Me

Please copy and paste:
1. ✅ Browser console error (F12 → Console)
2. ✅ Network response (F12 → Network → /api/users/addresses → Response tab)
3. ✅ Backend terminal error messages
4. ✅ Screenshot of the app when you click "Add Address"

This will help me fix the issue quickly!
