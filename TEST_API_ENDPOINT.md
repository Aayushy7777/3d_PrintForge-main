# API Endpoint Test - Run These Commands

## Test 1: Backend is Running
```bash
curl http://localhost:5000/
```
Expected: `{"status":"ok","message":"PrintForge backend..."}`

---

## Test 2: Users Endpoint Exists
```bash
curl -i http://localhost:5000/api/users/addresses \
  -H "Authorization: Bearer test"
```
Expected: Should return an error about invalid token (that's OK and shows endpoint exists)

---

## Test 3: Check Frontend Console Logs

Now do these steps:

1. Go to http://localhost:8080/profile
2. Make sure you're logged in (see user avatar)
3. Open DevTools: **F12**
4. Go to **Console** tab
5. Click "Add New Address"
6. Fill in test data:
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
7. Click "Add Address"
8. **Copy ALL the console logs** (they start with "Token retrieved:", "Sending request:", etc.)
9. **Share them with me**

---

## Test 4: Check Network Tab

1. Stay in DevTools
2. Click **Network** tab
3. Now try to add address again
4. Look for a request to `/api/users/addresses`
5. If it's RED (failed), click on it
6. Click **Response** tab at the bottom
7. **Copy what it says in the Response**
8. **Share it with me**

---

## Test 5: Backend Terminal

1. Look at the terminal where backend is running
2. When you try to add address, watch for any error messages
3. **Copy and share any errors** you see

---

**Once you share the console logs and network response, I can tell you exactly what's wrong!** ✅
