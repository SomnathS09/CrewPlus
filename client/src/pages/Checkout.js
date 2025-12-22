import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, couponsAPI } from '../services/api';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
import { FiTruck, FiPackage, FiCreditCard, FiDollarSign, FiTag, FiX } from 'react-icons/fi';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, refreshCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(false);
  const [orderType, setOrderType] = useState('delivery');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const deliveryFee = orderType === 'delivery' ? 50 : 0;
  const discount = appliedCoupon?.discount || 0;
  const total = Math.max(0, (cart?.total || 0) + deliveryFee - discount);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^[0-9]{10}$/.test(formData.phone)) newErrors.phone = 'Invalid phone number';

    if (orderType === 'delivery') {
      if (!formData.street.trim()) newErrors.street = 'Street address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.zipCode.trim()) newErrors.zipCode = 'Zip code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    try {
      const response = await couponsAPI.validateCoupon(couponCode, cart?.subtotal || 0);
      setAppliedCoupon(response.data.coupon);
      toast.success('Coupon applied successfully!');
    } catch (error) {
      toast.error(error.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!cart || cart.items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        type: orderType,
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        paymentMethod,
        notes: formData.notes,
        couponCode: appliedCoupon?.code || null
      };

      if (orderType === 'delivery') {
        orderData.deliveryAddress = {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        };
      }

      const response = await ordersAPI.createOrder(orderData);
      refreshCart();
      toast.success(`Order placed successfully! Order #${response.data.order.orderNumber}`);
      navigate('/orders');
    } catch (error) {
      toast.error(error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="checkout-title">Checkout</h1>

        <form onSubmit={handleSubmit} className="checkout-layout">
          <div className="checkout-form">
            {/* Order Type */}
            <section className="checkout-section">
              <h2>Order Type</h2>
              <div className="order-type-options">
                <label className={`order-type-card ${orderType === 'delivery' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="orderType"
                    value="delivery"
                    checked={orderType === 'delivery'}
                    onChange={() => setOrderType('delivery')}
                  />
                  <FiTruck className="type-icon" />
                  <span className="type-name">Delivery</span>
                  <span className="type-desc">Delivered to your address</span>
                </label>

                <label className={`order-type-card ${orderType === 'carryout' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="orderType"
                    value="carryout"
                    checked={orderType === 'carryout'}
                    onChange={() => setOrderType('carryout')}
                  />
                  <FiPackage className="type-icon" />
                  <span className="type-name">Carryout</span>
                  <span className="type-desc">Pick up from store</span>
                </label>
              </div>
            </section>

            {/* Contact Info */}
            <section className="checkout-section">
              <h2>Contact Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                  />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                  />
                  {errors.email && <span className="form-error">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="1234567890"
                  />
                  {errors.phone && <span className="form-error">{errors.phone}</span>}
                </div>
              </div>
            </section>

            {/* Delivery Address */}
            {orderType === 'delivery' && (
              <section className="checkout-section">
                <h2>Delivery Address</h2>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Street Address *</label>
                    <input
                      type="text"
                      name="street"
                      className={`form-input ${errors.street ? 'error' : ''}`}
                      value={formData.street}
                      onChange={handleChange}
                      placeholder="123 Main Street, Apt 4B"
                    />
                    {errors.street && <span className="form-error">{errors.street}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      name="city"
                      className={`form-input ${errors.city ? 'error' : ''}`}
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="New York"
                    />
                    {errors.city && <span className="form-error">{errors.city}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      name="state"
                      className="form-input"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="NY"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Zip Code *</label>
                    <input
                      type="text"
                      name="zipCode"
                      className={`form-input ${errors.zipCode ? 'error' : ''}`}
                      value={formData.zipCode}
                      onChange={handleChange}
                      placeholder="10001"
                    />
                    {errors.zipCode && <span className="form-error">{errors.zipCode}</span>}
                  </div>
                </div>
              </section>
            )}

            {/* Payment Method */}
            <section className="checkout-section">
              <h2>Payment Method</h2>
              <div className="payment-options">
                <label className={`payment-card ${paymentMethod === 'cash' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={() => setPaymentMethod('cash')}
                  />
                  <FiDollarSign className="payment-icon" />
                  <span>Cash on Delivery</span>
                </label>

                <label className={`payment-card ${paymentMethod === 'card' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                  />
                  <FiCreditCard className="payment-icon" />
                  <span>Card on Delivery</span>
                </label>
              </div>
            </section>

            {/* Notes */}
            <section className="checkout-section">
              <h2>Order Notes (Optional)</h2>
              <textarea
                name="notes"
                className="form-input"
                rows="3"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any special instructions for your order..."
              />
            </section>
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h2>Order Summary</h2>

            <div className="summary-items">
              {cart.items.map(item => (
                <div key={item._id} className="summary-item">
                  <span className="item-qty">{item.quantity}x</span>
                  <span className="item-name">{item.product?.name}</span>
                  <span className="item-price">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{cart.subtotal?.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Tax</span>
              <span>₹{cart.tax?.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>{deliveryFee > 0 ? `₹${deliveryFee}` : 'Free'}</span>
            </div>

            {/* Coupon Section */}
            <div className="coupon-section">
              {appliedCoupon ? (
                <div className="applied-coupon">
                  <div className="coupon-info">
                    <FiTag className="coupon-icon" />
                    <div>
                      <span className="coupon-code">{appliedCoupon.code}</span>
                      <span className="coupon-desc">{appliedCoupon.description}</span>
                    </div>
                  </div>
                  <button type="button" className="remove-coupon" onClick={handleRemoveCoupon}>
                    <FiX />
                  </button>
                </div>
              ) : (
                <div className="coupon-input-group">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="coupon-input"
                  />
                  <button
                    type="button"
                    className="btn btn-outline apply-coupon-btn"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            {discount > 0 && (
              <div className="summary-row discount">
                <span>Discount</span>
                <span className="discount-amount">-₹{discount.toFixed(2)}</span>
              </div>
            )}

            <div className="summary-divider"></div>

            <div className="summary-row total">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg place-order-btn"
              disabled={loading}
            >
              {loading ? <Loading size="small" /> : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
