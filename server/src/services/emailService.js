import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOrderConfirmationEmail = async (email, order, items) => {
  const itemsHtml = items.map(item => `
    <tr>
      <td>${item.product_name} x ${item.quantity}</td>
      <td>₹${item.total_price}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: `"${process.env.STORE_NAME}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Order Confirmation - ${order.order_number}`,
    html: `
      <h1>Thank you for your order!</h1>
      <p>Your order <strong>${order.order_number}</strong> has been received.</p>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <p><strong>Total Amount: ₹${order.total_amount}</strong></p>
      <p>We'll notify you when your order ships.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${email}`);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
  }
};

export const sendShippingEmail = async (email, order) => {
  const mailOptions = {
    from: `"${process.env.STORE_NAME}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Your order ${order.order_number} has shipped!`,
    html: `
      <h1>Good news!</h1>
      <p>Your order <strong>${order.order_number}</strong> is on its way.</p>
      ${order.tracking_number ? `<p>Tracking Number: <strong>${order.tracking_number}</strong></p>` : ''}
      <p>You can track its status in your profile history.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Shipping email sent to ${email}`);
  } catch (error) {
    console.error('Error sending shipping email:', error);
  }
};
