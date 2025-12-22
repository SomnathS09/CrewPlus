import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import { FiArrowLeft, FiPackage, FiClock, FiCheck, FiX, FiTruck, FiMapPin, FiPhone, FiUser } from 'react-icons/fi';
import './OrderDetails.css';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getOrder(id);
      setOrder(response.data.order);
    } catch (err) {
      setError(err.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock />;
      case 'confirmed': return <FiCheck />;
      case 'preparing': return <FiPackage />;
      case 'ready': return <FiCheck />;
      case 'delivered': return <FiTruck />;
      case 'cancelled': return <FiX />;
      default: return <FiClock />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'preparing': return 'info';
      case 'ready': return 'success';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'info';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const orderStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];

  const getStatusIndex = (status) => {
    if (status === 'cancelled') return -1;
    return orderStatuses.indexOf(status);
  };

  if (loading) {
    return <Loading fullPage />;
  }

  if (error || !order) {
    return (
      <div className="order-details-page">
        <div className="container">
          <div className="error-state">
            <FiPackage className="error-icon" />
            <h2>Order Not Found</h2>
            <p>{error || 'The order you are looking for does not exist.'}</p>
            <Link to="/orders" className="btn btn-primary">
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-details-page">
      <div className="container">
        <Link to="/orders" className="back-link">
          <FiArrowLeft /> Back to Orders
        </Link>

        <div className="order-details-header">
          <div>
            <h1>Order #{order.orderNumber}</h1>
            <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <span className={`order-status-badge ${getStatusClass(order.status)}`}>
            {getStatusIcon(order.status)}
            {order.status}
          </span>
        </div>

        {order.status !== 'cancelled' && (
          <div className="order-progress">
            <div className="progress-track">
              {orderStatuses.map((status, index) => (
                <div
                  key={status}
                  className={`progress-step ${index <= getStatusIndex(order.status) ? 'completed' : ''} ${index === getStatusIndex(order.status) ? 'current' : ''}`}
                >
                  <div className="step-icon">
                    {getStatusIcon(status)}
                  </div>
                  <span className="step-label">{status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="order-details-grid">
          <div className="order-items-section">
            <h2>Order Items</h2>
            <div className="items-list">
              {order.items.map((item, idx) => (
                <div key={idx} className="order-item-card">
                  <div className="item-info">
                    <h3>{item.name}</h3>
                    {item.size && <span className="item-size">Size: {item.size}</span>}
                    {item.customizations && item.customizations.length > 0 && (
                      <div className="item-customizations">
                        {item.customizations.map((cust, cidx) => (
                          <span key={cidx} className="customization-tag">
                            {cust.name} (+₹{cust.price})
                          </span>
                        ))}
                      </div>
                    )}
                    {item.notes && <p className="item-notes">Note: {item.notes}</p>}
                  </div>
                  <div className="item-qty-price">
                    <span className="item-qty">x{item.quantity}</span>
                    <span className="item-price">₹{item.price * item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="summary-row">
                <span>Tax</span>
                <span>₹{order.tax}</span>
              </div>
              {order.discount > 0 && (
                <div className="summary-row discount">
                  <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          </div>

          <div className="order-info-section">
            <div className="info-card">
              <h3>Delivery Details</h3>
              <div className="info-item">
                <FiTruck />
                <div>
                  <span className="info-label">Order Type</span>
                  <span className="info-value">{order.type}</span>
                </div>
              </div>
              {order.type === 'delivery' && order.deliveryAddress && (
                <div className="info-item">
                  <FiMapPin />
                  <div>
                    <span className="info-label">Delivery Address</span>
                    <span className="info-value">
                      {order.deliveryAddress.street}, {order.deliveryAddress.city}
                      {order.deliveryAddress.state && `, ${order.deliveryAddress.state}`}
                      {order.deliveryAddress.zipCode && ` - ${order.deliveryAddress.zipCode}`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="info-card">
              <h3>Contact Information</h3>
              <div className="info-item">
                <FiUser />
                <div>
                  <span className="info-label">Name</span>
                  <span className="info-value">{order.customerName}</span>
                </div>
              </div>
              <div className="info-item">
                <FiPhone />
                <div>
                  <span className="info-label">Phone</span>
                  <span className="info-value">{order.customerPhone}</span>
                </div>
              </div>
            </div>

            <div className="info-card">
              <h3>Payment</h3>
              <div className="info-item">
                <span className="info-label">Method</span>
                <span className="info-value payment-method">{order.paymentMethod}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Status</span>
                <span className={`info-value payment-status ${order.paymentStatus}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
