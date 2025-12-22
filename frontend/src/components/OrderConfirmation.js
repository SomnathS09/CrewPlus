import React from 'react';
import './OrderConfirmation.css';

const OrderConfirmation = ({ order, onClose }) => {
  return (
    <div className="confirmation-modal">
      <div className="confirmation-content">
        <div className="success-icon">✓</div>
        <h2>Order Placed Successfully!</h2>
        <div className="order-details">
          <p><strong>Order Number:</strong> {order.orderNumber}</p>
          <p><strong>Total:</strong> ₹{order.total.toFixed(2)}</p>
          <p><strong>Status:</strong> {order.status}</p>
        </div>
        <p className="thank-you">Thank you for your order!</p>
        <button onClick={onClose} className="close-confirmation-btn">
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
