import { useState, useEffect } from 'react';
import { productsAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';
import { FiPackage, FiAlertTriangle, FiPlus, FiMinus, FiRefreshCw, FiSearch } from 'react-icons/fi';
import './ManageInventory.css';

const ManageInventory = () => {
  const [products, setProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [threshold, setThreshold] = useState(10);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newInventory, setNewInventory] = useState('');

  useEffect(() => {
    fetchData();
  }, [categoryFilter, threshold]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categoryFilter) params.category = categoryFilter;

      const [productsRes, lowStockRes] = await Promise.all([
        productsAPI.getAllProductsAdmin(params),
        productsAPI.getLowStockProducts(threshold)
      ]);

      setProducts(productsRes.data.products);
      setLowStockProducts(lowStockRes.data.products);
    } catch (error) {
      toast.error('Error fetching inventory data');
    } finally {
      setLoading(false);
    }
  };

  const updateInventory = async (productId, operation, quantity = 10) => {
    try {
      await productsAPI.updateInventory(productId, { operation, quantity });
      toast.success('Inventory updated');
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to update inventory');
    }
  };

  const handleSetInventory = async (productId) => {
    if (newInventory === '' || isNaN(newInventory)) {
      toast.error('Please enter a valid number');
      return;
    }
    try {
      await productsAPI.updateInventory(productId, {
        operation: 'set',
        quantity: parseInt(newInventory)
      });
      toast.success('Inventory updated');
      setEditingProduct(null);
      setNewInventory('');
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to update inventory');
    }
  };

  const getStockStatus = (inventory) => {
    if (inventory === 0) return { label: 'Out of Stock', class: 'out-of-stock' };
    if (inventory <= threshold) return { label: 'Low Stock', class: 'low-stock' };
    return { label: 'In Stock', class: 'in-stock' };
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'low' && p.inventory <= threshold && p.inventory > 0) ||
      (stockFilter === 'out' && p.inventory === 0) ||
      (stockFilter === 'in' && p.inventory > threshold);
    return matchesSearch && matchesStock;
  });

  const stats = {
    total: products.length,
    inStock: products.filter(p => p.inventory > threshold).length,
    lowStock: products.filter(p => p.inventory <= threshold && p.inventory > 0).length,
    outOfStock: products.filter(p => p.inventory === 0).length
  };

  if (loading) {
    return <Loading fullPage />;
  }

  return (
    <div className="manage-inventory">
      <div className="page-header">
        <div>
          <h1>Inventory Management</h1>
          <p>Monitor and update stock levels</p>
        </div>
        <button className="btn btn-outline" onClick={fetchData}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="inventory-stats">
        <div className="stat-card">
          <FiPackage className="stat-icon" />
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Products</span>
          </div>
        </div>
        <div className="stat-card in-stock">
          <div className="stat-info">
            <span className="stat-value">{stats.inStock}</span>
            <span className="stat-label">In Stock</span>
          </div>
        </div>
        <div className="stat-card low-stock">
          <FiAlertTriangle className="stat-icon warning" />
          <div className="stat-info">
            <span className="stat-value">{stats.lowStock}</span>
            <span className="stat-label">Low Stock</span>
          </div>
        </div>
        <div className="stat-card out-of-stock">
          <div className="stat-info">
            <span className="stat-value">{stats.outOfStock}</span>
            <span className="stat-label">Out of Stock</span>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="low-stock-alert">
          <div className="alert-header">
            <FiAlertTriangle />
            <span>Low Stock Alert - {lowStockProducts.length} items need attention</span>
          </div>
          <div className="alert-items">
            {lowStockProducts.slice(0, 5).map(product => (
              <div key={product._id} className="alert-item">
                <span className="item-name">{product.name}</span>
                <span className="item-stock">{product.inventory} left</span>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => updateInventory(product._id, 'add', 20)}
                >
                  +20
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="inventory-filters">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          <option value="pizza">Pizzas</option>
          <option value="drink">Drinks</option>
          <option value="bread">Breads</option>
        </select>

        <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
          <option value="all">All Stock Levels</option>
          <option value="in">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>

        <div className="threshold-control">
          <label>Low stock threshold:</label>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(parseInt(e.target.value) || 10)}
            min="1"
            max="100"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => {
              const status = getStockStatus(product.inventory);
              return (
                <tr key={product._id} className={product.inventory === 0 ? 'out-of-stock-row' : ''}>
                  <td>
                    <div className="product-cell">
                      <img
                        src={product.imageUrl || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=50'}
                        alt={product.name}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=50';
                        }}
                      />
                      <span>{product.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="category-badge">{product.category}</span>
                  </td>
                  <td>
                    {editingProduct === product._id ? (
                      <div className="edit-inventory">
                        <input
                          type="number"
                          value={newInventory}
                          onChange={(e) => setNewInventory(e.target.value)}
                          placeholder={product.inventory}
                          autoFocus
                        />
                        <button onClick={() => handleSetInventory(product._id)}>Save</button>
                        <button onClick={() => { setEditingProduct(null); setNewInventory(''); }}>Cancel</button>
                      </div>
                    ) : (
                      <span
                        className="inventory-value clickable"
                        onClick={() => { setEditingProduct(product._id); setNewInventory(product.inventory.toString()); }}
                      >
                        {product.inventory}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${status.class}`}>
                      {status.label}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon subtract"
                        onClick={() => updateInventory(product._id, 'subtract', 10)}
                        disabled={product.inventory < 10}
                        title="Remove 10"
                      >
                        <FiMinus />
                      </button>
                      <button
                        className="btn-icon add"
                        onClick={() => updateInventory(product._id, 'add', 10)}
                        title="Add 10"
                      >
                        <FiPlus />
                      </button>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => updateInventory(product._id, 'add', 50)}
                      >
                        +50
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredProducts.length === 0 && (
        <div className="no-results">
          <FiPackage />
          <p>No products found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default ManageInventory;
