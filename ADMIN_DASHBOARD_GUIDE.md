# PrintForge Admin Dashboard Guide

## Overview

The admin dashboard provides operational visibility into PrintForge orders after checkout and payment. Admin routes are protected by the same JWT flow as customer routes, plus a backend role check against the `users.role` value.

## Admin Access

Frontend route:

```text
/admin
```

Backend gate:

```text
requireAdmin -> requireAuth -> users.role === "admin"
```

Non-admin users receive `403 Forbidden` from admin APIs and cannot access the admin route in the React app.

## Orders API

### List Orders

`GET /api/admin/orders`

Supported query parameters:

```text
page=1
limit=20
status=pending
startDate=2026-07-01
endDate=2026-07-31
search=customer@example.com
```

Response shape:

```json
{
  "orders": [
    {
      "id": "order-id",
      "user": {
        "email": "customer@example.com",
        "name": "Customer"
      },
      "items": [
        {
          "product_name": "Printed Part",
          "quantity": 1,
          "material": "PLA"
        }
      ],
      "payment_status": "paid",
      "status": "confirmed",
      "delivery_address": {}
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

### Update Order Status

`PATCH /api/admin/orders/:id/status`

```json
{
  "status": "shipped"
}
```

Allowed statuses:

```text
pending, confirmed, processing, shipped, delivered, cancelled
```

`PUT /api/admin/orders/:id/status` is also supported for compatibility with older frontend callers.

## Dashboard UI

The admin orders page shows:

- order id
- customer
- items
- material
- amount
- payment status
- order status
- date

Admins can open an order detail dialog to see the full delivery address and item breakdown. Status can be changed inline from the table.

## Manual Test Checklist

- Log in as a customer and confirm `/admin` redirects away.
- Call `GET /api/admin/orders` with a customer token and confirm `403`.
- Log in as an admin and open `/admin/orders`.
- Filter by status and search by customer email.
- Open an order detail dialog and confirm address plus PLA item material are visible.
- Update an order to `shipped`, then refresh and confirm the status persisted.

