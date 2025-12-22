import { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';
import { FiSearch, FiFilter, FiEye, FiCheck, FiX } from 'react-icons/fi';
import './ManageOrders.css';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: ''
  });

  useEffect(() => {
    fetchOrders();
  }, [filters.status, filters.type]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.type) params.type = filters.type;

      const response = await ordersAPI.getAllOrders(params);
      setOrders(response.data.orders);
    } catch (error) {
      toast.error('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'delivered'
    };
    return statusFlow[currentStatus];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

  return (
    <div className="manage-orders">
      <div className="page-header">
        <h1>Manage Orders</h1>
        <p>View and manage all customer orders</p>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by order number..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>

        <div className="filter-group">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">All Status</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
          >
            <option value="">All Types</option>
            <option value="delivery">Delivery</option>
            <option value="carryout">Carryout</option>
          </select>
        </div>
      </div>

      <div className="orders-layout">
        {/* Orders Table */}
        <div className="orders-table-container">
          {loading ? (
            <Loading />
          ) : orders.length === 0 ? (
            <div className="no-orders">No orders found</div>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr
                    key={order._id}
                    className={selectedOrder?._id === order._id ? 'selected' : ''}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="order-number">{order.orderNumber}</td>
                    <td>{order.customerInfo?.name}</td>
                    <td className="order-type">{order.type}</td>
                    <td>{order.items.length} items</td>
                    <td className="order-total">₹{order.total}</td>
                    <td>
                      <span className={`status-badge ${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="order-time">{formatDate(order.createdAt)}</td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="action-btn view"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                        >
                          <FiEye />
                        </button>
                        {getNextStatus(order.status) && (
                          <button
                            className="action-btn confirm"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatus(order._id, getNextStatus(order.status));
                            }}
                          >
                            <FiCheck />
                          </button>
                        )}
                        {['pending', 'confirmed'].includes(order.status) && (
                          <button
                            className="action-btn cancel"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatus(order._id, 'cancelled');
                            }}
                          >
                            <FiX />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Order Details Panel */}
        {selectedOrder && (
          <div className="order-details-panel">
            <div className="panel-header">
              <h3>Order Details</h3>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>
                <FiX />
              </button>
            </div>

            <div className="panel-content">
              <div className="detail-section">
                <h4>Order Info</h4>
                <div className="detail-row">
                  <span>Order #:</span>
                  <span>{selectedOrder.orderNumber}</span>
                </div>
                <div className="detail-row">
                  <span>Status:</span>
                  <span className={`status-badge ${selectedOrder.status}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Type:</span>
                  <span className="capitalize">{selectedOrder.type}</span>
                </div>
                <div className="detail-row">
                  <span>Payment:</span>
                  <span className="capitalize">{selectedOrder.paymentMethod}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Customer</h4>
                <div className="detail-row">
                  <span>Name:</span>
                  <span>{selectedOrder.customerInfo?.name}</span>
                </div>
                <div className="detail-row">
                  <span>Email:</span>
                  <span>{selectedOrder.customerInfo?.email}</span>
                </div>
                <div className="detail-row">
                  <span>Phone:</span>
                  <span>{selectedOrder.customerInfo?.phone}</span>
                </div>
                {selectedOrder.type === 'delivery' && selectedOrder.deliveryAddress && (
                  <div className="detail-row address">
                    <span>Address:</span>
                    <span>
                      {selectedOrder.deliveryAddress.street}, {selectedOrder.deliveryAddress.city}
                      {selectedOrder.deliveryAddress.state && `, ${selectedOrder.deliveryAddress.state}`}
                      {selectedOrder.deliveryAddress.zipCode && ` - ${selectedOrder.deliveryAddress.zipCode}`}
                    </span>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h4>Items</h4>
                <div className="order-items-list">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="order-item">
                      <span className="item-qty">{item.quantity}x</span>
                      <span className="item-name">{item.name}</span>
                      <span className="item-price">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail-section totals">
                <div className="detail-row">
                  <span>Subtotal:</span>
                  <span>₹{selectedOrder.subtotal}</span>
                </div>
                <div className="detail-row">
                  <span>Tax:</span>
                  <span>₹{selectedOrder.tax}</span>
                </div>
                {selectedOrder.deliveryFee > 0 && (
                  <div className="detail-row">
                    <span>Delivery Fee:</span>
                    <span>₹{selectedOrder.deliveryFee}</span>
                  </div>
                )}
                <div className="detail-row total">
                  <span>Total:</span>
                  <span>₹{selectedOrder.total}</span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="detail-section">
                  <h4>Notes</h4>
                  <p className="order-notes">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Status Update Buttons */}
              {!['delivered', 'cancelled'].includes(selectedOrder.status) && (
                <div className="status-actions">
                  {getNextStatus(selectedOrder.status) && (
                    <button
                      className="btn btn-primary"
                      onClick={() => updateStatus(selectedOrder._id, getNextStatus(selectedOrder.status))}
                    >
                      Mark as {getNextStatus(selectedOrder.status)}
                    </button>
                  )}
                  {['pending', 'confirmed'].includes(selectedOrder.status) && (
                    <button
                      className="btn btn-outline cancel-btn"
                      onClick={() => updateStatus(selectedOrder._id, 'cancelled')}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageOrders;
