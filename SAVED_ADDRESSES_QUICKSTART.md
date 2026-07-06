# Saved Addresses Quick Setup - 5 Minutes

## What Was Built

✅ Profile page with sidebar navigation (`/profile`)
✅ Saved Addresses section with full CRUD
✅ Add/Edit/Delete address modal
✅ Backend API endpoints
✅ User authentication and security
✅ Responsive design

---

## 📁 Files Created

**Frontend:**
- `src/pages/Profile.tsx`
- `src/components/profile/SavedAddresses.tsx`
- `src/components/profile/AddressCard.tsx`
- `src/components/profile/AddAddressModal.tsx`

**Backend:**
- `server/routes/users.js` (NEW)

**Modified:**
- `server/index.js` - Added users router
- `src/App.tsx` - Added /profile route

---

## ⚡ Quick Start (5 mins)

### 1. Verify Database (1 min)
```sql
-- Run in Supabase SQL editor
-- Should already exist from address collection system
SELECT * FROM delivery_addresses LIMIT 1;
```

### 2. Backend is Ready (0 min)
- ✅ users.js route file automatically handles JWT
- ✅ Reuses existing Firebase token verification
- ✅ Works with your current auth system

### 3. Test Everything (4 mins)

**Start backend:**
```bash
cd server
npm run dev
```

**Start frontend:**
```bash
npm run dev
```

**Test address page:**
1. Go to http://localhost:5173/profile
2. Login if needed (redirects automatically)
3. Click "Saved Addresses" in sidebar
4. Click "Add New Address"
5. Fill form and submit
6. See address in list
7. Click Edit or Delete to manage

---

## 🎯 API Endpoints

All require `Authorization: Bearer <TOKEN>` header

```
GET  /api/users/addresses           → List all user addresses
POST /api/users/addresses           → Create new address
PUT  /api/users/addresses/:id       → Update address
DELETE /api/users/addresses/:id     → Delete address
```

---

## 📍 User Flow

```
Login → Click Profile → Select Saved Addresses → Manage Addresses
                          ↓
                    ┌─────┴─────┐
                    ├─ Add New  ├─ View all →  Edit/Delete each
                    ├─ Orders   │
                    ├─ Account  │
                    └─ Settings ┘
```

---

## ✨ Key Features

| Feature | Status |
|---------|--------|
| View All Addresses | ✅ Done |
| Add New Address | ✅ Done |
| Edit Address | ✅ Done |
| Delete Address | ✅ Done (with confirmation) |
| Form Validation | ✅ Done |
| Loading States | ✅ Done (skeleton) |
| Empty State | ✅ Done |
| Responsive Design | ✅ Done |
| Security (JWT) | ✅ Done |
| User Isolation | ✅ Done |

---

## 🧪 Quick Test

### Add an Address
```bash
curl -X POST http://localhost:5000/api/users/addresses \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "phone_number": "+91 9876543210",
    "house_number": "123",
    "street": "Main St",
    "city": "Mumbai",
    "state": "MH",
    "postal_code": "400001",
    "country": "India"
  }'
```

### Get All Addresses
```bash
curl -X GET http://localhost:5000/api/users/addresses \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

---

## 🔗 Link to Navigation

Add profile link to navbar:

```tsx
// In Navbar component, add link to profile
<Link to="/profile" className="...">
  <User className="w-5 h-5" />
  Profile
</Link>
```

---

## 📊 Component Props

### SavedAddresses
- Fetches addresses automatically
- Shows loading state
- Handles add/edit/delete
- Displays empty state

### AddressCard
- Displays single address
- Edit and Delete buttons
- Clean card design

### AddAddressModal
- Form for add and edit
- Pre-fills on edit
- Zod validation
- React Hook Form

---

## ⚠️ Important

1. **Database:** delivery_addresses table must exist (already created)
2. **Auth:** Uses Firebase tokens via AuthContext
3. **Validation:** Client-side (Zod) + Server-side (regex)
4. **Security:** JWT verification on all endpoints
5. **User Isolation:** Users can only access their addresses

---

## 🚀 Next Steps

1. ✅ Start backend: `npm run dev` (in /server)
2. ✅ Start frontend: `npm run dev` (in root)
3. ✅ Navigate to /profile
4. ✅ Login if needed
5. ✅ Click Saved Addresses
6. ✅ Add your first address!

---

## 📝 Notes

- Addresses are stored per user via user_id
- All form validation uses same schema as checkout
- Designer: Clean, modern UI like Amazon/Flipkart
- Mobile: Fully responsive
- Performance: Efficient database queries with indexes

---

## 🎉 Status

**READY FOR IMMEDIATE USE!**

All components are complete, tested, and ready for production.

See `SAVED_ADDRESSES_GUIDE.md` for detailed documentation.
