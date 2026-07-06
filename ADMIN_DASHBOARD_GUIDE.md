# Admin Dashboard Guide

## Overview
Provides an administrative interface for managing orders in the PrintForge platform.

## Endpoints

### GET /api/admin/orders
**Description**: Retrieves a paginated list of orders with filtering and search capabilities.
**Headers**:
- Authorization: Bearer <JWT token> (admin role required)

**Query Parameters**:
- status (optional): Filter by order status (pending, confirmed, processing, shipped, delivered, cancelled)
- startDate (optional): Filter orders created after this date (ISO string)
- endDate (optional): Filter orders created before this date (ISO string)
- search (optional): Search by customer email (case-insensitive)
- page (optional, default 1): Page number for pagination
- limit (optional, default 20): Number of items per page (max 100)

**Success Response** (HTTP 200):
`json
{
  "orders": [
    {
      "id": "string",
      "order_number": "string",
      "status": "string",
      "payment_status": "string",
      "amount": number,
      "created_at": "string (ISO date)",
      "user": {
        "id": "string",
        "email": "string",
        "name": "string",
        "phone": "string"
      },
      "delivery_address": {
        "full_name": "string",
        "phone": "string",
        "address_line1": "string",
        "city": "string",
        "state": "string",
        "postal_code": "string",
        "country": "string"
      },
      "items": [
        {
          "id": "string",
          "product_id": "string",
          "quantity": number,
          "price": number,
          "material": "string",
          "product": {
            "id": "string",
            "name": "string",
            "image": "string"
          }
        }
      ]
    }
  ],
  "total": number,          // Total number of orders matching filters
  "page": number,           // Current page number
  "limit": number           // Items per page
}
`

### PATCH /api/admin/orders/:id/status
**Description**: Updates the status of a specific order.
**Headers**:
- Authorization: Bearer <JWT token> (admin role required)

**Request Body**:
`json
{
  "status": "string", // One of: pending, confirmed, processing, shipped, delivered, cancelled
  "tracking_number": "string" // Optional, for shipped/delivered status
}
`

**Success Response** (HTTP 200):
`json
{
  "id": "string",
  "order_number": "string",
  "status": "string",
  "payment_status": "string",
  "amount": number,
  // ... other order fields
}
`

**Error Responses**:
- 400: Invalid status value
- 403: User is not an admin
- 404: Order not found
- 500: Internal server error

## Features
- View and filter orders by status, date range, and customer email
- Search orders by customer email
- Paginated results for large datasets
- Update order status (with optional tracking number)
- Detailed order view including customer information, items, and delivery address

## Security
- Admin-only access: endpoints are protected by equireAdmin middleware
- JWT authentication required for all admin endpoints
- Data validation and sanitization applied to all inputs

## Usage Example
1. Admin navigates to /admin/orders in the dashboard
2. Dashboard fetches orders via GET /api/admin/orders?page=1&limit=20
3. Admin can filter by status using dropdown, set date range, or search by email
4. Clicking on an order row opens a detail modal with full information
5. To update status, admin selects new status from dropdown and optionally adds tracking number
6. Dashboard sends PATCH /api/admin/orders/:id/status with the selected status
7. Upon success, the order list updates to reflect the new status

## Dependencies
- Express.js middleware for authentication and authorization
- Supabase client for database interactions
- Role-based access control (admin vs customer)

## Future Enhancements
- Bulk actions (e.g., update status for multiple orders)
- Export orders to CSV/Excel
- Advanced analytics dashboard
- Order notes/internal communication
