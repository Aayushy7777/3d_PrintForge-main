import express from "express";
import { requireAuth } from "../middleware/auth.js";
import prisma from "../lib/prisma.js";
import { OrderRepository } from "../repositories/OrderRepository.js";
import { PaymentRepository } from "../repositories/PaymentRepository.js";
import { sendOrderConfirmationEmail } from "../lib/email.js";
import crypto from "crypto";

const router = express.Router();

// Initialize Razorpay instance
let razorpayInstance = null;
const initRazorpay = () => {
  if (razorpayInstance) return razorpayInstance;
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials not configured");
  }
  const Razorpay = require("razorpay");
  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
  return razorpayInstance;
};

// POST /api/payments/order
// Create a Razorpay order for a given order ID
router.post("/order", requireAuth, async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    // Fetch order and ensure it belongs to the user
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (order.userId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    if (order.paymentStatus !== "pending") {
      return res.status(400).json({ error: "Order already has a payment attempt" });
    }

    const amount = Math.round(order.total * 100); // amount in paise
    const currency = "INR";
    const receipt = `order_${orderId}_${Date.now()}`;

    // Create a pending payment record
    const payment = await PaymentRepository.createPayment({
      orderId,
      amount: order.total,
      currency,
      method: "razorpay",
      status: "PENDING",
    });

    // Create Razorpay order
    const instance = initRazorpay();
    const options = {
      amount,
      currency,
      receipt,
      payment_capture: 1, // auto capture
    };
    const razorpayOrder = await instance.orders.create(options);

    // Update payment with razorpay order id
    await PaymentRepository.updatePaymentDetails(payment.id, {
      razorpayOrderId: razorpayOrder.id,
    });

    res.json({
      id: razorpayOrder.id,
      amount,
      currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payments/verify
// Verify payment signature and update order/payment status
router.post("/verify", requireAuth, async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderId,
    } = req.body;

    if (
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature ||
      !orderId
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find order and verify ownership
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (order.userId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Retrieve payment by orderId
    const payment = await PaymentRepository.findByOrderId(orderId);
    if (!payment) {
      return res.status(404).json({ error: "Payment record not found" });
    }

    // Verify signature
    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const digest = shasum.digest("hex");

    if (digest !== razorpaySignature) {
      // Invalid signature
      await PaymentRepository.updatePaymentDetails(payment.id, {
        status: "FAILED",
        razorpayPaymentId,
        razorpaySignature,
      });
      // Optionally update order payment status
      await OrderRepository.updateOrderStatus(orderId, "FAILED_PAYMENT"); // Not a standard status; we could keep PENDING and rely on payment status field.
      // For simplicity, we will not change order status; just keep as PENDING.
      // We'll update paymentStatus field on order via a new method later.
      // For now, we just return error.
      return res.status(400).json({ error: "Invalid signature" });
    }

    // Payment is valid
    // Update payment with Razorpay details and mark as success
    await PaymentRepository.updatePaymentDetails(payment.id, {
      razorpayPaymentId,
      razorpaySignature,
      status: "SUCCESS",
    });

    // Update order status to CONFIRMED
    await OrderRepository.updateOrderStatus(orderId, "CONFIRMED");
    // Also update paymentStatus field on order (string)
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: "success" },
    });

    // Fetch order again with relations for email
    const updatedOrder = await OrderRepository.findById(orderId);
    // Send confirmation email (fire and forget, but await to catch errors)
    try {
      await sendOrderConfirmationEmail({
        ...updatedOrder,
        // Ensure related data is present (already included via findById)
      });
    } catch (emailErr) {
      console.error("Failed to send confirmation email:", emailErr);
    }

    res.json({ success: true, message: "Payment verified successfully" });
  } catch (err) {
    console.error("Error verifying payment:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
