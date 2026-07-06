# Admin Dashboard Guide - Order Management

## Overview
Administrative interface for managing orders in PrintForge. Provides search, filtering, and status update capabilities for order fulfillment.

## Database Schema

### Orders Table (via Prisma)

```prisma
model Order {
  id              String   @id @default(cuid())
  orderNumber     String   @unique
  status          OrderStatus @default(PENDING)
  paymentStatus   String   @default("pending")
  
  // Pricing
  subtotal        Decimal   @db.Decimal(10, 2)
  shippingCost    Decimal   @db.Decimal(10, 2) @default(0)
  discount        Decimal   @db.Decimal(10, 2) @default(0)
  tax             Decimal   @db.Decimal(10, 2) @default(0)  // 18% GST
  totalAmount     Decimal   @db.Decimal(10, 2)
  
  // Relations
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  deliveryAddressId String
  deliveryAddress DeliveryAddress @relation(fields: [deliveryAddressId], references: [id])
  items           OrderItem[]
  payment         Payment?
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([userId])
  @@index([status])
  @@index([paymentStatus])
  @@map("orders")
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}
```

## Backend Implementation

### Files Created/Modified

1. **`server/routes/admin.js`** (MODIFIED)
   - Added order management endpoints
   - Reused existing `requireAdmin` middleware

2. **`server/repositories/OrderRepository.js`** (MODIFIED)
   - Enhanced `getAllOrders` with filtering, search, pagination
   - Added any additional helper methods if needed

### API Endpoints (Admin Only)

All endpoints require admin authentication via JWT with admin role.

#### 1. List Orders: `GET /api/admin/orders`

**Query Parameters:**
- `page` (int, default: 1)
- `limit` (int, default: 10)
- `status` (string, optional): Filter by order status
- `startDate` (ISO string, optional): Filter from date
- `endDate` (ISO string, optional): Filter to date
- `search` (string, optional): Search by customer email

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "order-uuid",
      "orderNumber": "ORD-123456",
      "user": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "items": [
        {
          "product": {
            "name": "Custom PLA Print",
            "image": "url-to-image"
          },
          "quantity": 2,
          "material": "PLA"
        }
      ],
      "amount": 1500.00,
      "paymentStatus": "SUCCESS",
      "status": "PROCESSING",
      "createdAt": "2024-03-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

#### 2. Update Order Status: `PATCH /api/admin/orders/:id/status`

**Request:**
```json
{
  "status": "SHIPPED"
}
```

**Valid status values:** PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Order status updated",
  "data": {
    "id": "order-uuid",
    "status": "SHIPPED",
    "updatedAt": "2024-03-16T14:20:00Z"
  }
}
```

**Error Responses:**
- 400: Invalid status value
- 404: Order not found
- 403: Forbidden (non-admin user)
- 500: Server error

## Admin Authentication

Admin routes reuse the existing authentication system:
- `requireAuth` middleware validates JWT token
- `requireAdmin` middleware checks `role === 'admin'` from user record

## Admin Dashboard Features

### Orders Table

| Column | Description |
|--------|-------------|
| Order ID | Unique identifier (clickable for details) |
| Order Number | Human-readable order number |
| Customer | Name and email |
| Items | Summary of products with quantities |
| Material | Shows material (always PLA for now) |
| Amount | Total order value |
| Payment Status | SUCCESS, FAILED, PENDING |
| Order Status | Current processing stage |
| Date | Order creation timestamp |
| Actions | Status update dropdown |

### Filters & Search

- **Status Filter**: Dropdown to show orders by status
- **Date Range**: From/To date pickers
- **Search Box**: Filters by customer email (partial match)
- **Pagination**: Page size selector (10, 25, 50, 100)

### Order Details View

Clicking on an order opens a modal/drawer with:
- Complete customer information
- Itemized list with product details, quantities, material, pricing
- Payment details (method, transaction ID if applicable)
- Delivery address
- Order timeline/status history
- Status update dropdown (if applicable)

## Implementation Details

### Server-Side

1. **Authorization**
   - Uses existing `requireAdmin` middleware from `server/middleware/auth.js`
   - Returns 403 for non-admin users

2. **Data Fetching**
   - Leverages `OrderRepository.getAllOrders()` with enhanced filtering
   - Includes relations: user (name, email), items (with product details)

3. **Filtering Logic**
   - `status`: Exact match on OrderStatus enum
   - `dateRange`: Filters by `createdAt` between start and end dates
   - `search`: Case-insensitive partial match on user.email

4. **Pagination**
   - Calculates offset: `(page - 1) * limit`
   - Returns total count for pagination UI

5. **Status Updates**
   - Uses `OrderRepository.updateOrderStatus()` (existing)
   - Validates against allowed enum values

### Client-Side (Conceptual)

Since the frontend admin dashboard is not yet implemented, this guide outlines the expected components:

#### Components
1. **AdminLayout** - Base layout with sidebar navigation
2. **OrdersPage** - Main view with filters and table
3. **OrderTable** - Tabular display of orders
4. **OrderDetailModal** - Detailed view of selected order
5. **StatusSelect** - Dropdown for updating order status

#### Data Flow
```
Mount Admin Dashboard
    ?
Fetch authenticated user (verify admin role)
    ?
Load filters from URL/query params
    ?
Request GET /api/admin/orders?filters...
    ?
Display loading state
    ?
Render table with received data
    ?
User interacts with filters/search
    ?
Debounce and fetch updated list
    ?
User clicks order row
    ?
Show modal with order details
    ?
User changes status via dropdown
    ?
PATCH /api/admin/orders/:id/status
    ?
Optimistic UI update
    ?
Show success toast
```

## Security Considerations

1. **Role-Based Access Control**
   - Only users with `role: 'admin'` can access `/api/admin/*` endpoints
   - Middleware validates role from user record in database

2. **Data Protection**
   - Sensitive payment details (like Razorpay IDs) are not exposed in list view
   - Full payment details available only in order detail view (if needed for support)

3. **Input Validation**
   - Status transitions validated against allowed values
   - ID parameters validated as valid UUIDs
   - Date parameters validated as proper ISO strings

4. **Rate Limiting**
   - Inherits global rate limiting from Express middleware
   - Consider stricter limits for admin actions if needed

## Implementation Checklist

- [ ] Admin middleware correctly validates role
- [ ] GET /api/admin/orders returns paginated results
- [ ] Filtering by status works correctly
- [ ] Date range filtering functions properly
- [ ] Search by email returns partial matches
- [ ] Pagination controls calculate correct totals
- [ ] Status update endpoint accepts valid statuses
- [ ] Invalid status returns 400 with error message
- [ ] Non-admin users receive 403 Forbidden
- [ ] Order details load with all related data
- [ ] Loading states handled appropriately
- [ ] Error states display user-friendly messages
- [ ] Successful updates show confirmation feedback

## UI/UX Guidelines

### Visual Design
- Use existing Admin layout from `/src/pages/admin/`
- Table rows should be hover-highlighted
- Status badges: color-coded (pending: yellow, processing: blue, shipped: purple, delivered: green, cancelled: red)
- Empty state when no orders match filters

### Interaction Patterns
- Click row to expand/collapse details (or open modal)
- Immediate feedback on status changes
- Confirmation dialog for destructive actions (if any added later)
- Refresh button to reload current filter set

### Accessibility
- Table navigable via keyboard
- Sufficient color contrast for status badges
- Form labels associated with inputs
- ARIA labels for interactive elements

## Performance Considerations

- Indexes on `status`, `paymentStatus`, `createdAt` for filtering
- Limit eagerly loaded relations to needed fields
- Consider database views for complex reporting queries
- Cache aggregated stats if needed for dashboard widgets

## Testing Scenarios

### Permissions
- [ ] Non-admin user redirected/blocked from admin routes
- [ ] Admin user can access all endpoints
- [ ] Token without role claim treated as non-admin

### Listing
- [ ] Default page shows first 10 orders sorted by newest
- [ ] Changing page size updates limit parameter
- [ ] Navigation between pages works correctly
- [ ] Total count matches filtered results

### Filtering
- [ ] Status filter shows only matching orders
- [ ] Date range excludes outside dates
- [ ] Search finds partial email matches
- [ ] Multiple filters combine with AND logic

### Actions
- [ ] Status update persists to database
- [ ] UI updates optimistically then syncs
- [ ] Failed updates show error and revert
- [ ] Invalid status values rejected

## References
- React Admin Patterns: https://marmelab.com/react-admin/
- Data Tables: https://tanstack.com/table/v8
- Role-Based Access Control: https://en.wikipedia.org/wiki/Role-based_access_control
