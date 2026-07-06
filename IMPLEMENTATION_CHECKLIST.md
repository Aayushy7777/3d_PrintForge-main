# Implementation Checklist & Deployment Guide

## Pre-Implementation Checklist

- [ ] Review `ADDRESS_SYSTEM_GUIDE.md` for complete overview
- [ ] Review `SETUP_AND_API_EXAMPLES.md` for setup steps
- [ ] Ensure Supabase project is set up and running
- [ ] Verify JWT secret is configured in `.env`
- [ ] Confirm Firebase/auth system is working

## Database Migration Checklist

- [ ] Create `delivery_addresses` table in Supabase
- [ ] Add `delivery_address_id` column to `orders` table
- [ ] Create indexes for performance
- [ ] Set up Row Level Security (RLS) if needed
- [ ] Test database connections

## Backend Implementation Checklist

- [ ] ✅ Created `server/lib/addressValidation.js`
  - Phone validation regex
  - Email validation regex
  - Postal code validation regex
  - Sanitization functions

- [ ] ✅ Modified `server/routes/orders.js`
  - Added JWT verification middleware
  - Added `POST /api/orders/address` endpoint
  - Updated `POST /api/orders` to accept `delivery_address_id`
  - Error handling for validation failures

- [ ] Test address validation
  - Valid phone numbers (Indian, US, international)
  - Invalid phone numbers (too short, invalid format)
  - Email validation (optional handling)
  - Postal code formats

- [ ] Test JWT authentication
  - Requests without token (should fail 401)
  - Requests with invalid token (should fail 401)
  - Requests with valid token (should succeed)

- [ ] Test address storage
  - Address saves to database
  - User ID is correctly associated
  - Address ID is returned in response
  - Timestamps are created correctly

- [ ] Test order creation
  - Order saves with `delivery_address_id`
  - Order without `delivery_address_id` still works (nullable)
  - Order can be retrieved with address data

## Frontend Implementation Checklist

- [ ] ✅ Created `src/components/checkout/AddressForm.tsx`
  - 10 form fields implemented
  - Zod validation schema configured
  - React Hook Form integration
  - Phone, postal code, email validation
  - Sanitization of input
  - Loading states
  - Error display

- [ ] ✅ Created `src/components/checkout/AddressDialog.tsx`
  - Modal dialog wrapper
  - Proper open/close handling
  - Integration with AddressForm

- [ ] ✅ Modified `src/pages/Cart.tsx`
  - Address dialog state management
  - Checkout button handler
  - User email fetching
  - Order creation logic
  - Error handling
  - Success notifications

- [ ] Test AddressForm component
  - Form renders correctly
  - All fields are visible
  - Validation works on blur/submit
  - Error messages display
  - Country dropdown works
  - Textarea for instructions works

- [ ] Test AddressDialog component
  - Dialog opens when checkout clicked
  - Dialog closes on cancel
  - Dialog closes on successful save
  - User email pre-fills correctly

- [ ] Test Cart integration
  - Checkout button disabled for non-authenticated users
  - Toast notification for login required
  - Address dialog opens on checkout
  - Order created after address saved
  - Cart clears after successful order
  - Error notifications for failed submission
  - Loading spinner shows during submission

## API Integration Testing Checklist

- [ ] Test `POST /api/orders/address`
  - Valid address data saves
  - Invalid data returns error
  - Unauthorized request fails
  - Address ID returned correctly
  - User ID associated correctly

- [ ] Test `POST /api/orders`
  - Order created with address reference
  - Order created without address (backwards compatible)
  - Order data stored correctly
  - Response includes order ID

- [ ] Test authentication flow
  - Login/registration works
  - JWT token stored in localStorage
  - Token sent in Authorization header
  - Expired/invalid tokens rejected

## End-to-End Testing Checklist

### Happy Path (Complete Flow)
1. [ ] User logs in
2. [ ] User adds products to cart
3. [ ] User navigates to Cart page
4. [ ] User clicks "Checkout"
5. [ ] Address dialog opens
6. [ ] User fills all required fields
7. [ ] User clicks "Confirm Address"
8. [ ] Address validates and saves
9. [ ] Order is created
10. [ ] Success notification shows
11. [ ] Cart is cleared
12. [ ] Check database: address and order saved correctly

### Error Cases
1. [ ] User not logged in → Show login prompt
2. [ ] Required field empty → Show validation error
3. [ ] Invalid phone format → Show error message
4. [ ] Invalid email format → Show error message
5. [ ] Invalid postal code → Show error message
6. [ ] Network error → Show error toast
7. [ ] Address save fails → Show error, keep form open
8. [ ] Order creation fails → Show error, don't clear cart

### Edge Cases
1. [ ] Very long delivery instructions → Truncate to 500 chars
2. [ ] Special characters in name → Accept and sanitize
3. [ ] Multiple spaces in phone → Accept and validate
4. [ ] Non-English characters → Support international names
5. [ ] Rapid clicking submit → Disable button during submission
6. [ ] Browser auto-fill → Form pre-fills correctly
7. [ ] Mobile view → Responsive layout works

## Performance Checklist

- [ ] Database indexes created for queries
- [ ] Component renders efficiently
- [ ] No unnecessary re-renders
- [ ] Loading states prevent double-submission
- [ ] Form validation doesn't lag
- [ ] API calls don't block UI

## Security Checklist

- [ ] Input sanitization prevents injection
- [ ] CORS headers correct
- [ ] JWT validation on backend
- [ ] User can only access own addresses
- [ ] Password hashing in authentication
- [ ] Sensitive data not logged
- [ ] No tokens exposed in console
- [ ] HTTPS in production

## Deployment Checklist

### Before Production Deployment

1. [ ] All tests passing
2. [ ] Database migrations applied
3. [ ] Environment variables set
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
   - `VITE_API_URL` (production URL)

4. [ ] Code review completed
5. [ ] Documentation reviewed
6. [ ] Backup of database created
7. [ ] Staging environment tested

### Production Deployment Steps

1. [ ] Deploy backend code
2. [ ] Restart backend server
3. [ ] Deploy frontend code
4. [ ] Clear browser cache
5. [ ] Test production flow
6. [ ] Monitor error logs
7. [ ] Verify database constraints

### Post-Deployment Verification

- [ ] Address form loads correctly
- [ ] Can save address successfully
- [ ] Can create order with address
- [ ] Database updates reflecting changes
- [ ] No 500 errors in backend logs
- [ ] API response times acceptable
- [ ] Users can complete full checkout flow
- [ ] Email notifications sending (if configured)

## Monitoring & Maintenance

### Regular Checks
- [ ] Monitor error rates in backend logs
- [ ] Check database storage usage
- [ ] Review validation error patterns
- [ ] Monitor API response times
- [ ] Check for failed orders

### Database Maintenance
- [ ] Archive old addresses (if needed)
- [ ] Update RLS policies if needed
- [ ] Review and optimize indexes
- [ ] Check for orphaned addresses

## Documentation to Keep Updated

- [ ] `ADDRESS_SYSTEM_GUIDE.md` - System design
- [ ] `SETUP_AND_API_EXAMPLES.md` - Setup & testing
- [ ] API documentation (if shared)
- [ ] Database schema diagram
- [ ] User guide for testing

## Future Enhancement Items

- [ ] Address auto-complete API integration
- [ ] Save multiple addresses per user
- [ ] Select from saved addresses
- [ ] Edit address before payment
- [ ] Address validation with postal code lookup
- [ ] Delivery type selection (home/office/pickup)
- [ ] Same-day delivery options
- [ ] Address change after order placed (before fulfillment)
- [ ] Integration with shipping API
- [ ] Real-time delivery tracking
- [ ] SMS notifications with address confirmation

## Troubleshooting Common Issues

### "Cannot find module '@hookform/resolvers'"
```bash
# Install missing dependency
npm install @hookform/resolvers
```

### JWT token not being sent
```javascript
// Check localStorage
console.log(localStorage.getItem('auth_token'));

// Verify Authorization header
// Should be: "Bearer <token>"
```

### CORS errors
```bash
# Ensure backend has CORS enabled
# In server/index.js: app.use(cors());
```

### Address not saving to database
1. Check JWT token validity
2. Verify `delivery_addresses` table exists
3. Check `user_id` is valid
4. Review Supabase logs

### Order not created
1. Verify address was created first
2. Check `delivery_address_id` is valid
3. Ensure `orders` table has new column
4. Check required fields in request

## Performance Optimization Tips

1. **Lazy load AddressForm** when needed
2. **Memoize validation** functions
3. **Batch database queries** if multiple addresses
4. **Cache user data** to reduce API calls
5. **Optimize form rerenders** with useCallback

## Support & Escalation

### Common Questions

**Q: Can users edit saved addresses?**
A: Currently not supported. Future enhancement to implement edit/update endpoint.

**Q: Can users save multiple addresses?**
A: Currently saves only current address. Future enhancement to support saved addresses.

**Q: What if delivery address is invalid?**
A: Validation prevents invalid addresses. Customers can try again with corrected data.

**Q: Are addresses stored indefinitely?**
A: Yes, until deleted. Implement cleanup policy as needed.

### Escalation Path

1. Check error logs
2. Verify database state
3. Test API endpoint directly
4. Review recent deployments
5. Contact infrastructure team if needed
