import { useState, useEffect } from 'react';
import { customizationsAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiX } from 'react-icons/fi';
import './ManageCustomizations.css';

const ManageCustomizations = () => {
  const [customizations, setCustomizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomization, setEditingCustomization] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    type: 'topping',
    price: 0,
    isVegetarian: true,
    isAvailable: true,
    applicableCategories: ['pizza']
  });

  useEffect(() => {
    fetchCustomizations();
  }, []);

  const fetchCustomizations = async () => {
    try {
      setLoading(true);
      const response = await customizationsAPI.getCustomizations();
      setCustomizations(response.data.customizations);
    } catch (error) {
      toast.error('Failed to fetch customizations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomization) {
        await customizationsAPI.updateCustomization(editingCustomization._id, formData);
        toast.success('Customization updated successfully');
      } else {
        await customizationsAPI.createCustomization(formData);
        toast.success('Customization created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchCustomizations();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleEdit = (customization) => {
    setEditingCustomization(customization);
    setFormData({
      name: customization.name,
      type: customization.type,
      price: customization.price,
      isVegetarian: customization.isVegetarian,
      isAvailable: customization.isAvailable,
      applicableCategories: customization.applicableCategories
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customization?')) return;
    try {
      await customizationsAPI.deleteCustomization(id);
      toast.success('Customization deleted successfully');
      fetchCustomizations();
    } catch (error) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  const handleToggleAvailability = async (id) => {
    try {
      await customizationsAPI.toggleCustomization(id);
      fetchCustomizations();
    } catch (error) {
      toast.error('Failed to toggle availability');
    }
  };

  const resetForm = () => {
    setEditingCustomization(null);
    setFormData({
      name: '',
      type: 'topping',
      price: 0,
      isVegetarian: true,
      isAvailable: true,
      applicableCategories: ['pizza']
    });
  };

  const handleCategoryChange = (category) => {
    setFormData(prev => ({
      ...prev,
      applicableCategories: prev.applicableCategories.includes(category)
        ? prev.applicableCategories.filter(c => c !== category)
        : [...prev.applicableCategories, category]
    }));
  };

  const filteredCustomizations = filterType === 'all'
    ? customizations
    : customizations.filter(c => c.type === filterType);

  const groupedCustomizations = filteredCustomizations.reduce((acc, cust) => {
    if (!acc[cust.type]) acc[cust.type] = [];
    acc[cust.type].push(cust);
    return acc;
  }, {});

  const typeLabels = {
    crust: 'Crust Options',
    sauce: 'Sauce Options',
    cheese: 'Cheese Options',
    topping: 'Toppings',
    extra: 'Extras'
  };

  if (loading) {
    return <Loading fullPage />;
  }

  return (
    <div className="manage-customizations-page">
      <div className="page-header">
        <div>
          <h1>Manage Customizations</h1>
          <p>Configure food customization options</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          <FiPlus /> Add Customization
        </button>
      </div>

      <div className="filter-bar">
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">All Types</option>
          <option value="crust">Crust</option>
          <option value="sauce">Sauce</option>
          <option value="cheese">Cheese</option>
          <option value="topping">Toppings</option>
          <option value="extra">Extras</option>
        </select>
      </div>

      {Object.keys(groupedCustomizations).length === 0 ? (
        <div className="no-customizations">
          <div className="no-customizations-icon">🍕</div>
          <h3>No Customizations Yet</h3>
          <p>Start by adding crust, sauce, cheese, or topping options</p>
        </div>
      ) : (
        Object.entries(groupedCustomizations).map(([type, items]) => (
          <div key={type} className="customization-section">
            <h2>{typeLabels[type] || type}</h2>
            <div className="customizations-grid">
              {items.map(cust => (
                <div key={cust._id} className={`customization-card ${!cust.isAvailable ? 'unavailable' : ''}`}>
                  <div className="customization-header">
                    <span className="customization-name">{cust.name}</span>
                    <div className="customization-actions">
                      <button onClick={() => handleToggleAvailability(cust._id)} title="Toggle availability">
                        {cust.isAvailable ? <FiToggleRight className="active" /> : <FiToggleLeft />}
                      </button>
                      <button onClick={() => handleEdit(cust)} title="Edit">
                        <FiEdit2 />
                      </button>
                      <button onClick={() => handleDelete(cust._id)} className="delete-btn" title="Delete">
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                  <div className="customization-price">+ ₹{cust.price}</div>
                  <div className="customization-tags">
                    {cust.isVegetarian && <span className="tag veg">Veg</span>}
                    {!cust.isVegetarian && <span className="tag non-veg">Non-Veg</span>}
                    {cust.applicableCategories.map(cat => (
                      <span key={cat} className="tag category">{cat}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCustomization ? 'Edit Customization' : 'Add Customization'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <FiX />
              </button>
            </div>
            <form className="customization-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Extra Cheese, Thin Crust"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="crust">Crust</option>
                    <option value="sauce">Sauce</option>
                    <option value="cheese">Cheese</option>
                    <option value="topping">Topping</option>
                    <option value="extra">Extra</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Applicable Categories</label>
                <div className="checkbox-group">
                  {['pizza', 'drink', 'bread'].map(cat => (
                    <label key={cat} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.applicableCategories.includes(cat)}
                        onChange={() => handleCategoryChange(cat)}
                      />
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isVegetarian}
                    onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
                  />
                  Vegetarian Option
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  />
                  Available
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCustomization ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCustomizations;
