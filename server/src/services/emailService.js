const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Generate order confirmation email HTML
const generateOrderConfirmationHTML = (order) => {
  const itemsHTML = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.size || '-'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const deliveryAddress = order.type === 'delivery' && order.deliveryAddress
    ? `
      <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
        <h3 style="margin: 0 0 10px 0; color: #333;">Delivery Address</h3>
        <p style="margin: 0; color: #666;">
          ${order.deliveryAddress.street}<br>
          ${order.deliveryAddress.city}${order.deliveryAddress.state ? ', ' + order.deliveryAddress.state : ''}<br>
          ${order.deliveryAddress.zipCode}
        </p>
      </div>
    `
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #e53935 0%, #c62828 100%); padding: 30px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 28px;">🍕 CrewPlus Pizza</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Order Confirmation</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 60px; height: 60px; background: #4caf50; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px;">
              <span style="font-size: 30px; color: #fff;">✓</span>
            </div>
            <h2 style="margin: 0; color: #333;">Thank You for Your Order!</h2>
            <p style="color: #666; margin: 10px 0 0 0;">Your order has been received and is being processed.</p>
          </div>

          <!-- Order Details -->
          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Order Number:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #e53935;">${order.orderNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Order Type:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600; text-transform: capitalize;">${order.type}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Payment Method:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600; text-transform: capitalize;">${order.paymentMethod}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Estimated ${order.type === 'delivery' ? 'Delivery' : 'Ready'}:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${new Date(order.estimatedDelivery).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
              </tr>
            </table>
          </div>

          <!-- Order Items -->
          <h3 style="margin: 0 0 15px 0; color: #333;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 12px; text-align: left; color: #666; font-weight: 600;">Item</th>
                <th style="padding: 12px; text-align: center; color: #666; font-weight: 600;">Size</th>
                <th style="padding: 12px; text-align: center; color: #666; font-weight: 600;">Qty</th>
                <th style="padding: 12px; text-align: right; color: #666; font-weight: 600;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <!-- Totals -->
          <div style="background: #f8f9fa; border-radius: 8px; padding: 15px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Subtotal:</td>
                <td style="padding: 8px 0; text-align: right;">₹${order.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Tax (10%):</td>
                <td style="padding: 8px 0; text-align: right;">₹${order.tax.toFixed(2)}</td>
              </tr>
              ${order.deliveryFee > 0 ? `
              <tr>
                <td style="padding: 8px 0; color: #666;">Delivery Fee:</td>
                <td style="padding: 8px 0; text-align: right;">₹${order.deliveryFee.toFixed(2)}</td>
              </tr>
              ` : ''}
              ${order.discount > 0 ? `
              <tr>
                <td style="padding: 8px 0; color: #4caf50;">Discount:</td>
                <td style="padding: 8px 0; text-align: right; color: #4caf50;">-₹${order.discount.toFixed(2)}</td>
              </tr>
              ` : ''}
              <tr style="border-top: 2px solid #ddd;">
                <td style="padding: 12px 0; font-weight: 700; font-size: 18px; color: #333;">Total:</td>
                <td style="padding: 12px 0; text-align: right; font-weight: 700; font-size: 18px; color: #e53935;">₹${order.total.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          ${deliveryAddress}

          <!-- Track Order Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/track" style="display: inline-block; background: #e53935; color: #fff; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 600;">Track Your Order</a>
          </div>

          <!-- Contact Info -->
          <div style="text-align: center; color: #666; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px;">
            <p style="margin: 0 0 10px 0;">Questions about your order?</p>
            <p style="margin: 0;">Call us at <strong>+1 9999999999</strong> or email <strong>contact@crewplus.com</strong></p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} CrewPlus Pizza. All rights reserved.</p>
          <p style="color: #666; margin: 10px 0 0 0; font-size: 11px;">IIT Jodhpur, N.H. 62, Nagaur Road, Karwar, Jodhpur, 342030</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (order) => {
  // Check if SMTP is configured
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('SMTP not configured, skipping email notification');
    return { success: false, message: 'SMTP not configured' };
  }

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: order.customerInfo.email,
      subject: `Order Confirmed - ${order.orderNumber} | CrewPlus Pizza`,
      html: generateOrderConfirmationHTML(order)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send order confirmation email:', error.message);
    return { success: false, error: error.message };
  }
};

// Send order status update email
const sendOrderStatusUpdateEmail = async (order) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('SMTP not configured, skipping email notification');
    return { success: false, message: 'SMTP not configured' };
  }

  const statusMessages = {
    confirmed: 'Your order has been confirmed and will be prepared shortly.',
    preparing: 'Our chefs are now preparing your delicious order!',
    ready: order.type === 'delivery'
      ? 'Your order is ready and out for delivery!'
      : 'Your order is ready for pickup!',
    delivered: 'Your order has been delivered. Enjoy your meal!',
    cancelled: 'Your order has been cancelled. If you have any questions, please contact us.'
  };

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: order.customerInfo.email,
      subject: `Order ${order.status.charAt(0).toUpperCase() + order.status.slice(1)} - ${order.orderNumber} | CrewPlus Pizza`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: #fff;">
            <div style="background: linear-gradient(135deg, #e53935 0%, #c62828 100%); padding: 30px; text-align: center;">
              <h1 style="color: #fff; margin: 0; font-size: 28px;">🍕 CrewPlus Pizza</h1>
            </div>
            <div style="padding: 30px; text-align: center;">
              <h2 style="color: #333;">Order Status Update</h2>
              <p style="color: #666; font-size: 16px;">Order #${order.orderNumber}</p>
              <div style="background: ${order.status === 'cancelled' ? '#ffebee' : '#e8f5e9'}; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0; color: ${order.status === 'cancelled' ? '#c62828' : '#2e7d32'}; text-transform: uppercase;">
                  ${order.status}
                </h3>
                <p style="color: #666; margin: 10px 0 0 0;">${statusMessages[order.status] || 'Your order status has been updated.'}</p>
              </div>
              <a href="${process.env.CLIENT_URL}/track" style="display: inline-block; background: #e53935; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px;">Track Your Order</a>
            </div>
            <div style="background: #333; padding: 20px; text-align: center;">
              <p style="color: #999; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} CrewPlus Pizza. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order status update email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send order status update email:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail
};
