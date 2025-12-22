import { useState } from 'react';
import { ordersAPI } from '../services/api';
import { FiSearch, FiPackage, FiClock, FiCheckCircle, FiTruck, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './TrackOrder.css';

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: FiPackage },
  { key: 'confirmed', label: 'Confirmed', icon: FiCheckCircle },
  { key: 'preparing', label: 'Preparing', icon: FiClock },
  { key: 'ready', label: 'Ready', icon: FiPackage },
  { key: 'delivered', label: 'Delivered', icon: FiTruck }
];

const TrackOrder = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();

    if (!orderNumber.trim()) {
      toast.error('Please enter an order number');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await ordersAPI.trackOrder(orderNumber.trim());
      setOrder(response.data.order);
    } catch (error) {
      setOrder(null);
      toast.error(error.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status) => {
    if (status === 'cancelled') return -1;
    return statusSteps.findIndex(step => step.key === status);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div className="track-order-page">
      <div className="container">
        <div className="track-order-header">
          <h1>Track Your Order</h1>
          <p>Enter your order number to see the current status</p>
        </div>

        <form onSubmit={handleTrack} className="track-order-form">
          <div className="search-input-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Enter order number (e.g., ORD-20241222-0001)"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="search-input"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Tracking...' : 'Track Order'}
          </button>
        </form>

        {searched && !loading && (
          <div className="track-order-result">
            {order ? (
              <div className="order-tracking-card">
                <div className="order-tracking-header">
                  <div>
                    <h2>Order #{order.orderNumber}</h2>
                    <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
                  </div>
                  <span className={`order-type-badge ${order.type}`}>
                    {order.type === 'delivery' ? 'Delivery' : 'Carryout'}
                  </span>
                </div>

                {order.status === 'cancelled' ? (
                  <div className="order-cancelled">
                    <FiXCircle className="cancelled-icon" />
                    <h3>Order Cancelled</h3>
                    <p>This order has been cancelled.</p>
                  </div>
                ) : (
                  <>
                    <div className="order-progress">
                      {statusSteps.map((step, index) => {
                        const currentIndex = getStatusIndex(order.status);
                        const isCompleted = index <= currentIndex;
                        const isCurrent = index === currentIndex;
                        const Icon = step.icon;

                        return (
                          <div
                            key={step.key}
                            className={`progress-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                          >
                            <div className="step-icon">
                              <Icon />
                            </div>
                            <span className="step-label">{step.label}</span>
                            {index < statusSteps.length - 1 && (
                              <div className={`step-line ${isCompleted && !isCurrent ? 'completed' : ''}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {order.estimatedDelivery && order.status !== 'delivered' && (
                      <div className="estimated-time">
                        <FiClock />
                        <span>
                          Estimated {order.type === 'delivery' ? 'Delivery' : 'Ready'}: {formatDate(order.estimatedDelivery)}
                        </span>
                      </div>
                    )}
                  </>
                )}

                <div className="order-items-summary">
                  <h3>Order Items</h3>
                  <ul>
                    {order.items.map((item, index) => (
                      <li key={index}>
                        <span className="item-qty">{item.quantity}x</span>
                        <span className="item-name">{item.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="no-order-found">
                <FiPackage className="no-order-icon" />
                <h3>Order Not Found</h3>
                <p>We couldn't find an order with that number. Please check and try again.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
