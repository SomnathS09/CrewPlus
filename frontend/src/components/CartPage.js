import React from 'react';
import { formatPrice } from '../utils/helpers';
import './CartPage.css';

const CartPage = ({ cart, onClose, onCheckout }) => {
  const [orderType, setOrderType] = React.useState('delivery');
  const [loading, setLoading] = React.useState(false);

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => {
      return total + (item.productId.price * item.quantity);
    }, 0);
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      await onCheckout(orderType);
    } catch (error) {
      console.error('Checkout error:', error);
      // Error will be handled by parent component with toast
    } finally {
      setLoading(false);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="cart-modal">
        <div className="cart-content">
          <div className="cart-header">
            <h2>Your Cart</h2>
            <button onClick={onClose} className="close-btn">✕</button>
          </div>
          <div className="cart-empty">
            <p>Your cart is empty</p>
          </div>
        </div>
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <div className="cart-modal">
      <div className="cart-content">
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>
        
        <div className="cart-items">
          {cart.items.map((item, index) => (
            <div key={index} className="cart-item">
              <div className="cart-item-info">
                <h3>{item.productId.name}</h3>
                <p>Quantity: {item.quantity}</p>
              </div>
              <div className="cart-item-price">
                {formatPrice(item.productId.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        <div className="cart-total">
          <h3>Total: {formatPrice(total)}</h3>
        </div>

        <div className="order-type">
          <label>
            <input
              type="radio"
              value="delivery"
              checked={orderType === 'delivery'}
              onChange={(e) => setOrderType(e.target.value)}
            />
            Delivery
          </label>
          <label>
            <input
              type="radio"
              value="carryout"
              checked={orderType === 'carryout'}
              onChange={(e) => setOrderType(e.target.value)}
            />
            Carryout
          </label>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="checkout-btn"
        >
          {loading ? 'Processing...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
};

export default CartPage;
