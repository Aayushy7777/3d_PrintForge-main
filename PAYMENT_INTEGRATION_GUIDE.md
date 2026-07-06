# PrintForge Payment Integration Guide

## Overview

PrintForge uses Razorpay Checkout for online payments. The frontend only opens Razorpay after the backend creates an internal order and a Razorpay order. A payment is treated as successful only after the backend verifies the Razorpay HMAC signature.

## Environment Variables

Configure these in `server/.env`:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=orders@example.com
SMTP_PASS=xxxxx
STORE_NAME=PrintForge
```

No payment or SMTP secret is hardcoded in the app.

## Payment Flow

1. Customer creates an order from checkout with `POST /api/orders`.
2. Frontend calls `POST /api/payments/create-order` with the internal `orderId`.
3. Backend looks up the order amount, creates a Razorpay order in paise, and returns the Razorpay order plus `RAZORPAY_KEY_ID`.
4. Frontend loads `https://checkout.razorpay.com/v1/checkout.js` and opens the Razorpay modal.
5. On payment success, frontend sends `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature` to `POST /api/payments/verify`.
6. Backend verifies the HMAC SHA256 signature using `RAZORPAY_KEY_SECRET`.
7. On valid signature, the order is marked `confirmed` with `payment_status = paid`, payment details are persisted, the cart is cleared, and a confirmation email is sent asynchronously.
8. On invalid signature, the order stays pending, `payment_status = failed`, and no confirmation email is sent.

## API Contract

### Create Razorpay Order

`POST /api/payments/create-order`

```json
{
  "orderId": "internal-order-id"
}
```

Response:

```json
{
  "order": {
    "id": "order_razorpay",
    "amount": 123450,
    "currency": "INR"
  },
  "key_id": "rzp_test_xxxxx"
}
```

### Verify Payment

`POST /api/payments/verify`

```json
{
  "orderId": "internal-order-id",
  "razorpay_order_id": "order_razorpay",
  "razorpay_payment_id": "pay_razorpay",
  "razorpay_signature": "signature"
}
```

Response:

```json
{
  "message": "Payment verified successfully"
}
```

## Retry Behavior

If the Razorpay modal is dismissed or verification fails, the frontend keeps a pending order id and shows a retry action. Online checkout does not clear the cart until payment verification succeeds.

## Email Confirmation

Order confirmation email is triggered only after verified payment. It includes:

- order id or order number
- itemized products
- material per item, currently always PLA
- amount paid
- delivery address
- estimated timeline placeholder

SMTP failures are logged and do not fail the payment verification response.

## Manual Test Checklist

- Use Razorpay test credentials in `server/.env`.
- Add a product to cart and confirm the product page only allows PLA.
- Place an online checkout order.
- Complete payment in Razorpay test mode.
- Confirm `/api/payments/verify` returns success.
- Confirm the order shows `payment_status = paid`.
- Confirm the email arrives.
- Dismiss a Razorpay modal and confirm retry is available.

