import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI, productsAPI, authAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import { FiDollarSign, FiShoppingBag, FiUsers, FiPackage, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [userStats, setUserStats] = useState({ total: 0, active: 0 });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, lowStockRes, ordersRes, usersRes] = await Promise.all([
        ordersAPI.getAnalytics(),
        productsAPI.getLowStockProducts(15),
        ordersAPI.getAllOrders({ limit: 5 }),
        authAPI.getAllUsers({ limit: 1 })
      ]);

      setAnalytics(analyticsRes.data.analytics);
      setLowStockProducts(lowStockRes.data.products);
      setRecentOrders(ordersRes.data.orders);
      setUserStats({
        total: usersRes.data.pagination.total,
        active: usersRes.data.users.filter(u => u.isActive).length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#e53935', '#1976d2', '#43a047', '#fb8c00', '#8e24aa'];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return <Loading fullPage />;
  }

  const stats = [
    {
      title: 'Total Revenue',
      value: formatCurrency(analytics?.summary?.totalRevenue || 0),
      icon: <FiDollarSign />,
      color: '#10b981',
      change: '+12%'
    },
    {
      title: 'Total Orders',
      value: analytics?.summary?.totalOrders || 0,
      icon: <FiShoppingBag />,
      color: '#3b82f6',
      change: '+8%'
    },
    {
      title: 'Avg Order Value',
      value: formatCurrency(analytics?.summary?.averageOrderValue || 0),
      icon: <FiTrendingUp />,
      color: '#f59e0b',
      change: '+5%'
    },
    {
      title: 'Total Users',
      value: userStats.total,
      icon: <FiUsers />,
      color: '#8b5cf6',
      change: '+15%'
    }
  ];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card" style={{ '--stat-color': stat.color }}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <span className="stat-title">{stat.title}</span>
              <span className="stat-value">{stat.value}</span>
              <span className="stat-change">{stat.change} from last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Revenue Chart */}
        <div className="dashboard-card chart-card">
          <h3>Revenue Overview</h3>
          {analytics?.dailyRevenue?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="_id" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#e53935"
                  strokeWidth={3}
                  dot={{ fill: '#e53935', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">No revenue data available</div>
          )}
        </div>

        {/* Order Status Distribution */}
        <div className="dashboard-card">
          <h3>Order Status</h3>
          {analytics?.statusBreakdown?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics.statusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="_id"
                  label={({ _id, count }) => `${_id}: ${count}`}
                >
                  {analytics.statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">No order data available</div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>
              <FiAlertTriangle className="warning-icon" /> Low Stock Alert
            </h3>
            <Link to="/admin/inventory" className="view-all">View All</Link>
          </div>
          {lowStockProducts.length > 0 ? (
            <div className="low-stock-list">
              {lowStockProducts.slice(0, 5).map(product => (
                <div key={product._id} className="low-stock-item">
                  <span className="product-name">{product.name}</span>
                  <span className={`stock-count ${product.inventory <= 5 ? 'critical' : 'warning'}`}>
                    {product.inventory} left
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">All products are well stocked!</div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Recent Orders</h3>
            <Link to="/admin/orders" className="view-all">View All</Link>
          </div>
          {recentOrders.length > 0 ? (
            <div className="recent-orders-list">
              {recentOrders.map(order => (
                <div key={order._id} className="recent-order-item">
                  <div className="order-info">
                    <span className="order-number">{order.orderNumber}</span>
                    <span className="order-customer">{order.customerInfo?.name}</span>
                  </div>
                  <div className="order-meta">
                    <span className={`order-status ${order.status}`}>{order.status}</span>
                    <span className="order-total">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">No recent orders</div>
          )}
        </div>

        {/* Popular Items */}
        <div className="dashboard-card full-width">
          <h3>Popular Items</h3>
          {analytics?.popularItems?.length > 0 ? (
            <div className="popular-items-grid">
              {analytics.popularItems.slice(0, 5).map((item, index) => (
                <div key={index} className="popular-item">
                  <span className="rank">#{index + 1}</span>
                  <span className="item-name">{item.name}</span>
                  <span className="item-sales">{item.totalQuantity} sold</span>
                  <span className="item-revenue">{formatCurrency(item.totalRevenue)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">No sales data available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
