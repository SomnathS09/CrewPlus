import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import { FiPackage, FiClock, FiCheck, FiX, FiTruck, FiEye } from 'react-icons/fi';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [activeFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeFilter !== 'all') {
        params.status = activeFilter;
      }
      const response = await ordersAPI.getMyOrders(params);
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filters = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'preparing', label: 'Preparing' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <div className="orders-page">
      <div className="container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>Track and manage your orders</p>
        </div>

        <div className="orders-filters">
          {filters.map(filter => (
            <button
              key={filter.id}
              className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {loading ? (
          <Loading />
        ) : orders.length === 0 ? (
          <div className="no-orders">
            <FiPackage className="no-orders-icon" />
            <h3>No orders found</h3>
            <p>You haven't placed any orders yet.</p>
            <Link to="/menu" className="btn btn-primary">
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order.orderNumber}</h3>
                    <span className="order-date">{formatDate(order.createdAt)}</span>
                  </div>
                  <span className={`order-status ${getStatusClass(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                </div>

                <div className="order-items">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="order-item">
                      <span className="item-qty">{item.quantity}x</span>
                      <span className="item-name">{item.name}</span>
                      <span className="item-price">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <span className="more-items">
                      +{order.items.length - 3} more items
                    </span>
                  )}
                </div>

                <div className="order-footer">
                  <div className="order-details">
                    <span className="order-type">{order.type}</span>
                    <span className="order-total">Total: ₹{order.total}</span>
                  </div>
                  <Link to={`/orders/${order._id}`} className="btn btn-outline btn-sm">
                    <FiEye /> View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
