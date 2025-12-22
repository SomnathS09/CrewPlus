import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';
import { FiPlus, FiMinus, FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import './Cart.css';

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [updatingItems, setUpdatingItems] = useState({});

  const handleQuantityChange = async (itemId, newQuantity) => {
    setUpdatingItems(prev => ({ ...prev, [itemId]: true }));
    await updateQuantity(itemId, newQuantity);
    setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
  };

  const handleRemove = async (itemId) => {
    setUpdatingItems(prev => ({ ...prev, [itemId]: true }));
    await removeFromCart(itemId);
    setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading && !cart) {
    return <Loading fullPage />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="cart-page empty-cart">
        <div className="empty-cart-content">
          <FiShoppingBag className="empty-icon" />
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any items to your cart yet.</p>
          <Link to="/menu" className="btn btn-primary btn-lg">
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <button className="clear-cart-btn" onClick={clearCart}>
            <FiTrash2 /> Clear Cart
          </button>
        </div>

        <div className="cart-layout">
          <div className="cart-items">
            {cart.items.map((item) => (
              <div key={item._id} className="cart-item">
                <div className="item-image">
                  <img
                    src={item.product?.imageUrl || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200'}
                    alt={item.product?.name}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200';
                    }}
                  />
                </div>

                <div className="item-details">
                  <h3 className="item-name">{item.product?.name}</h3>
                  {item.size && (
                    <span className="item-size">
                      Size: {item.size.charAt(0).toUpperCase() + item.size.slice(1).replace('_', ' ')}
                    </span>
                  )}
                  {item.customizations && item.customizations.length > 0 && (
                    <div className="item-customizations">
                      {item.customizations.map((cust, idx) => (
                        <span key={idx} className="customization-tag">
                          + {cust.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.notes && (
                    <span className="item-notes">Note: {item.notes}</span>
                  )}
                </div>

                <div className="item-price">
                  ₹{item.price + (item.customizationTotal || 0)}
                </div>

                <div className="item-quantity">
                  <button
                    onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                    disabled={updatingItems[item._id] || item.quantity <= 1}
                  >
                    <FiMinus />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                    disabled={updatingItems[item._id]}
                  >
                    <FiPlus />
                  </button>
                </div>

                <div className="item-total">
                  ₹{(item.price + (item.customizationTotal || 0)) * item.quantity}
                </div>

                <button
                  className="remove-btn"
                  onClick={() => handleRemove(item._id)}
                  disabled={updatingItems[item._id]}
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>

            <div className="summary-row">
              <span>Subtotal ({cart.items.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
              <span>₹{cart.subtotal?.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Tax (10%)</span>
              <span>₹{cart.tax?.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Delivery Fee</span>
              <span className="free">Calculated at checkout</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total">
              <span>Total</span>
              <span>₹{cart.total?.toFixed(2)}</span>
            </div>

            <button
              className="checkout-btn btn btn-primary btn-lg"
              onClick={handleCheckout}
            >
              Proceed to Checkout
              <FiArrowRight />
            </button>

            {!isAuthenticated && (
              <p className="login-note">
                <Link to="/login">Login</Link> to save your cart and view order history
              </p>
            )}

            <Link to="/menu" className="continue-shopping">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
