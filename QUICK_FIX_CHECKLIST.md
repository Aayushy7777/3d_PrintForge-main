# Quick Fix Checklist - Address Save Error

## ✅ Pre-Check (Do These First)

1. **Is backend running?**
   ```bash
   # In /server directory
   npm run dev
   # Should show: "Server listening on port 5000"
   ```

2. **Is frontend running?**
   - Should be on http://localhost:8080/

3. **Is database table created?**
   - Go to Supabase dashboard
   - Check if `delivery_addresses` table exists
   - If not, run the SQL from SETUP_AND_API_EXAMPLES.md

4. **Are you logged in?**
   - Click your avatar in navbar
   - Make sure you see "My Profile" option (not just "Sign in")

---

## 🔧 Quick Test

### Test 1: Simple Backend Check
```bash
curl http://localhost:5000/
```
Should return:
```json
{"status":"ok","message":"PrintForge backend (Express + Supabase)"}
```

### Test 2: Address Endpoint Check
```bash
curl http://localhost:5000/api/users/addresses \
  -H "Authorization: Bearer test-token"
```
Should return an error about invalid token (that's expected and good!)

---

## 📋 Exact Steps to Find Error

1. **Open browser DevTools**
   - Press F12
   - Click "Console" tab

2. **Add an address**
   - Go to http://localhost:8080/profile
   - Make sure "Saved Addresses" is selected in sidebar
   - Click "Add New Address"
   - Fill in the form
   - Click "Add Address"

3. **Copy the error**
   - Look in the Console tab
   - Find the RED error message
   - Copy the entire error text

4. **Check Network request**
   - Stay in DevTools
   - Click "Network" tab
   - Try to add address again
   - Look for request to `/api/users/addresses`
   - Click on it
   - Click "Response" tab
   - Copy the response

---

## 🚨 Common Errors & Fixes

### Error: "Authentication required. Please log in."
**Means:** User not logged in
**Fix:** Click avatar → Make sure you see profile options, not just "Sign in"

### Error: "Invalid token"
**Means:** Firebase token issue
**Fix:**
```
1. Logout
2. Clear browser cache (Ctrl+Shift+Delete)
3. Login again
4. Try adding address again
```

### Error: "Address not found in database"
**Means:** delivery_addresses table missing
**Fix:** Go to Supabase → Create table from SQL in SETUP_AND_API_EXAMPLES.md

### Error: "Failed to save address"
**Means:** API error - need to see exact message
**Fix:** Share the exact error from browser console

---

## 📸 What I Need to Help You

Please share:
1. **Screenshot** of the error in the app
2. **Browser console error** (F12 → Console)
3. **Network response** (F12 → Network → /api/users/addresses response)
4. **Backend terminal output** (if there are errors)

---

## 🎯 Let's Debug Together

**Just tell me:**
- What error message do you see?
- Where does it appear (in app? console? popup?)
- What exact steps did you take before the error?

I'll fix it! 💪
