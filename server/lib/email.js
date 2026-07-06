const nodemailer = require("nodemailer");

// Create transporter using SMTP credentials from environment
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: parseInt(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send order confirmation email
 * @param {Object} orderData - Order object from database (with user, items, deliveryAddress populated)
 */
async function sendOrderConfirmationEmail(orderData) {
  try {
    const { user, items, deliveryAddress, orderNumber, totalAmount, createdAt } = orderData;

    // Verify transporter configuration
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("SMTP credentials not configured. Skipping email sending.");
      return;
    }

    // Email content
    const subject = `Order Confirmation #${orderNumber} - ${process.env.STORE_NAME || "PrintForge"}`;

    // Build items table rows
    const itemsRows = items
      .map(
        (item) => `
      <tr>
        <td>${item.product?.name || "Unknown Product"}</td>
        <td>${item.quantity}</td>
        <td>${item.material || "PLA"}</td>
        <td>${(item.product?.price || 0) * item.quantity}</td>
      </tr>
    `
      )
      .join("");

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thank you for your order!</h2>
        <p>Hello ${user.name || user.email},</p>
        <p>Your order has been received and is being processed.</p>
        
        <h3>Order Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Item</th>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Qty</th>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Material</th>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="text-align: right; padding: 8px; border-top: 2px solid #333;"><strong>Total:</strong></td>
              <td style="text-align: left; padding: 8px; border-top: 2px solid #333;"><strong>${totalAmount.toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>
        
        <h3>Shipping Address</h3>
        <p>
          ${deliveryAddress?.fullName || ""}<br />
          ${deliveryAddress?.addressLine1 || ""}
          ${deliveryAddress?.addressLine2 ? `<br />${deliveryAddress.addressLine2}` : ""}<br />
          ${deliveryAddress?.city || ""}, ${deliveryAddress?.state || ""} ${deliveryAddress?.postalCode || ""}<br />
          ${deliveryAddress?.country || ""}<br />
          Phone: ${deliveryAddress?.phone || ""}
        </p>
        
        <p>Order placed on: ${new Date(createdAt).toLocaleString()}</p>
        
        <p>We'll notify you when your order ships.</p>
        
        <p>Thank you for choosing ${process.env.STORE_NAME || "PrintForge"}!</p>
        
        <hr />
        <p style="font-size: 0.9em; color: #666;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `;

    // Send email
    await transporter.sendMail({
      from: `"${process.env.SMTP_USER}" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject,
      html,
    });

    console.log(`Order confirmation email sent to ${user.email}`);
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
    // Do not throw; we don't want to fail the payment verification because of email issues
  }
}

module.exports = { sendOrderConfirmationEmail };
