import { useState, useEffect } from 'react';
import { productsAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiPackage, FiSearch } from 'react-icons/fi';
import './ManageProducts.css';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'pizza',
    price: '',
    inventory: '',
    imageUrl: '',
    isVegetarian: false,
    isSpicy: false,
    ingredients: ''
  });

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      const response = await productsAPI.getAllProductsAdmin(params);
      setProducts(response.data.products);
    } catch (error) {
      toast.error('Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const openModal = (product = null) => {
    if (product) {
      setEditProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        category: product.category,
        price: product.price,
        inventory: product.inventory,
        imageUrl: product.imageUrl || '',
        isVegetarian: product.isVegetarian,
        isSpicy: product.isSpicy,
        ingredients: product.ingredients?.join(', ') || ''
      });
    } else {
      setEditProduct(null);
      setFormData({
        name: '',
        description: '',
        category: 'pizza',
        price: '',
        inventory: '',
        imageUrl: '',
        isVegetarian: false,
        isSpicy: false,
        ingredients: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      inventory: parseInt(formData.inventory),
      ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(i => i)
    };

    try {
      if (editProduct) {
        await productsAPI.updateProduct(editProduct._id, productData);
        toast.success('Product updated successfully');
      } else {
        await productsAPI.createProduct(productData);
        toast.success('Product created successfully');
      }
      closeModal();
      fetchProducts();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await productsAPI.deleteProduct(productId);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const updateInventory = async (productId, operation, quantity = 10) => {
    try {
      await productsAPI.updateInventory(productId, { operation, quantity });
      toast.success('Inventory updated');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update inventory');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="manage-products">
      <div className="page-header">
        <div>
          <h1>Manage Products</h1>
          <p>Add, edit, and manage your product inventory</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <FiPlus /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="pizza">Pizzas</option>
            <option value="drink">Drinks</option>
            <option value="bread">Breads</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <Loading />
      ) : (
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product._id} className={`product-card ${!product.isAvailable ? 'unavailable' : ''}`}>
              <div className="product-image">
                <img
                  src={product.imageUrl || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300'}
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300';
                  }}
                />
                {!product.isAvailable && <span className="unavailable-badge">Unavailable</span>}
              </div>

              <div className="product-info">
                <h3>{product.name}</h3>
                <span className="category-badge">{product.category}</span>
                <p className="price">₹{product.price}</p>

                <div className="inventory-control">
                  <FiPackage />
                  <span className={product.inventory <= 10 ? 'low-stock' : ''}>
                    {product.inventory} in stock
                  </span>
                  <div className="inventory-btns">
                    <button onClick={() => updateInventory(product._id, 'subtract')}>-10</button>
                    <button onClick={() => updateInventory(product._id, 'add')}>+10</button>
                  </div>
                </div>

                <div className="product-actions">
                  <button className="edit-btn" onClick={() => openModal(product)}>
                    <FiEdit2 /> Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(product._id)}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    name="category"
                    className="form-input"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="pizza">Pizza</option>
                    <option value="drink">Drink</option>
                    <option value="bread">Bread</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    className="form-input"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Inventory</label>
                  <input
                    type="number"
                    name="inventory"
                    className="form-input"
                    value={formData.inventory}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    className="form-input"
                    rows="2"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Image URL</label>
                  <input
                    type="url"
                    name="imageUrl"
                    className="form-input"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Ingredients (comma-separated)</label>
                  <input
                    type="text"
                    name="ingredients"
                    className="form-input"
                    value={formData.ingredients}
                    onChange={handleChange}
                    placeholder="Cheese, Tomato, Basil..."
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isVegetarian"
                      checked={formData.isVegetarian}
                      onChange={handleChange}
                    />
                    Vegetarian
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="isSpicy"
                      checked={formData.isSpicy}
                      onChange={handleChange}
                    />
                    Spicy
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
