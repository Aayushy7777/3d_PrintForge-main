import nodemailer from 'nodemailer';

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createTransporter() {
  if (!hasSmtpConfig()) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function money(value) {
  return `INR ${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function addressLines(address) {
  if (!address) return ['Address not available'];

  const line1 = [address.house_number, address.address_line1, address.street]
    .filter(Boolean)
    .join(' ');
  const line2 = [address.address_line2, address.city, address.state, address.postal_code]
    .filter(Boolean)
    .join(', ');

  return [
    address.full_name,
    line1,
    line2,
    address.country,
    address.phone_number || address.phone,
  ].filter(Boolean);
}

export async function sendOrderConfirmationEmail(email, order, items = [], address = null) {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn('SMTP is not configured; skipping order confirmation email.');
    return;
  }

  const itemRows = items.map((item) => {
    const name = item.product_name || item.name || item.product?.name || '3D printed item';
    const quantity = Number(item.quantity || 1);
    const total = item.total_price ?? item.price ?? item.unit_price ?? 0;
    const material = item.material || 'PLA';

    return `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">${material}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${money(total)}</td>
      </tr>
    `;
  }).join('');

  const plainItems = items.map((item) => {
    const name = item.product_name || item.name || item.product?.name || '3D printed item';
    return `- ${name} x ${item.quantity || 1} | material: ${item.material || 'PLA'}`;
  }).join('\n');

  const lines = addressLines(address);
  const orderNumber = order.order_number || order.id;
  const amount = order.total_amount ?? order.total ?? order.amount;

  await transporter.sendMail({
    from: `"${process.env.STORE_NAME || 'PrintForge'}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Order Confirmation - ${orderNumber}`,
    text: [
      `Thank you for your order ${orderNumber}.`,
      '',
      'Items:',
      plainItems || '- PLA 3D printed item',
      '',
      `Amount paid: ${money(amount)}`,
      '',
      'Delivery address:',
      lines.join('\n'),
      '',
      'Estimated timeline: 3-5 business days after print validation.',
    ].join('\n'),
    html: `
      <h1>Thank you for your order!</h1>
      <p>Your payment is verified and order <strong>${orderNumber}</strong> is confirmed.</p>
      <table style="border-collapse:collapse;width:100%;max-width:640px;">
        <thead>
          <tr>
            <th align="left" style="padding:8px;border-bottom:2px solid #111;">Item</th>
            <th align="center" style="padding:8px;border-bottom:2px solid #111;">Qty</th>
            <th align="left" style="padding:8px;border-bottom:2px solid #111;">Material</th>
            <th align="right" style="padding:8px;border-bottom:2px solid #111;">Amount</th>
          </tr>
        </thead>
        <tbody>${itemRows || '<tr><td colspan="4">PLA 3D printed item</td></tr>'}</tbody>
      </table>
      <p><strong>Amount paid:</strong> ${money(amount)}</p>
      <p><strong>Delivery address:</strong><br>${lines.join('<br>')}</p>
      <p><strong>Estimated timeline:</strong> 3-5 business days after print validation.</p>
    `,
  });

  console.log(`Order confirmation email sent to ${email}`);
}

export async function sendShippingEmail(email, order) {
  const transporter = createTransporter();
  if (!transporter) return;

  await transporter.sendMail({
    from: `"${process.env.STORE_NAME || 'PrintForge'}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Your order ${order.order_number || order.id} has shipped`,
    html: `
      <h1>Good news!</h1>
      <p>Your order <strong>${order.order_number || order.id}</strong> is on its way.</p>
      ${order.tracking_number ? `<p>Tracking number: <strong>${order.tracking_number}</strong></p>` : ''}
    `,
  });
}
