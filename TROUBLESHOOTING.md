# Troubleshooting Guide

## "Failed to execute 'json' on 'Response': Unexpected end of JSON input"

This error occurs when the frontend tries to parse JSON from an empty or invalid response. Here's how to fix it:

### Common Causes & Solutions

#### 1. Backend Server Not Running
**Symptom:** Error appears when loading products or trying to login

**Solution:**
```bash
cd server
npm run dev
```

Verify backend is running:
- Open http://localhost:5000
- Should see: `{"status":"ok","message":"PrintForge backend (Express + Supabase)"}`

#### 2. Backend Server on Wrong Port
**Symptom:** Frontend can't connect to backend

**Check:**
- Backend should run on port **5000** (default)
- Frontend proxy in `vite.config.ts` points to `http://localhost:5000`
- If you changed backend port, update `vite.config.ts` proxy target

#### 3. Database Connection Failed
**Symptom:** Backend starts but API calls fail

**Solution:**
```bash
cd server
npm run test
```

Check:
- `.env` file exists in `server/` folder
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set correctly
- Supabase project is active (not paused)

#### 4. CORS Issues
**Symptom:** Network errors in browser console

**Solution:**
- Backend already has CORS enabled (`app.use(cors())`)
- If still having issues, check backend logs for CORS errors

#### 5. Empty Products Table
**Symptom:** Products page loads but shows no products

**Solution:**
```bash
cd server
npm run seed
```

This populates the products table from `server/data/products.json`

#### 6. Proxy Not Working
**Symptom:** API calls fail with network errors

**Check:**
- Vite dev server is running (`npm run dev`)
- `vite.config.ts` has proxy configuration
- Browser DevTools → Network tab shows requests going to `/api/*`

**Fix:**
Restart both frontend and backend servers

---

## Quick Diagnostic Steps

1. **Check Backend:**
   ```bash
   curl http://localhost:5000/api/products
   ```
   Should return JSON array (empty `[]` if no products seeded)

2. **Check Frontend:**
   - Open browser DevTools → Console
   - Look for specific error messages
   - Check Network tab for failed requests

3. **Check Database:**
   ```bash
   cd server
   npm run test
   ```

4. **Check Environment:**
   ```bash
   cd server
   cat .env  # Should show SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET
   ```

---

## Error Messages Explained

### "Network error. Is the backend server running on port 5000?"
- Backend server is not running
- Backend is on a different port
- Firewall blocking connection

### "Empty response from server"
- Backend returned empty response
- Database query returned no results
- Backend crashed mid-request

### "Expected JSON but got..."
- Backend returned HTML (404 page, error page)
- Backend returned plain text
- Proxy misconfiguration

### "Invalid JSON response"
- Backend returned malformed JSON
- Response was truncated
- Backend error message in wrong format

---

## Still Having Issues?

1. **Check Backend Logs:**
   ```bash
   cd server
   npm run dev
   ```
   Look for error messages in terminal

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

3. **Verify Setup:**
   - Run `cd server && npm run test`
   - Check Supabase dashboard → Table Editor
   - Verify `.env` file has correct values

4. **Restart Everything:**
   ```bash
   # Stop all servers (Ctrl+C)
   # Then restart:
   cd server && npm run dev  # Terminal 1
   npm run dev                # Terminal 2 (from root)
   ```

---

## Prevention

To avoid this error:
1. ✅ Always start backend before frontend
2. ✅ Run `npm run test` after setting up `.env`
3. ✅ Seed products with `npm run seed`
4. ✅ Check browser console for early warnings
5. ✅ Verify backend is accessible at http://localhost:5000
