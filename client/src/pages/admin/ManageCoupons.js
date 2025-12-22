import { useState, useEffect } from 'react';
import { couponsAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiX, FiTag } from 'react-icons/fi';
import './ManageCoupons.css';

const ManageCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'percentage',
    value: '',
    minOrderAmount: '',
    maxDiscount: '',
    usageLimit: '',
    userUsageLimit: '1',
    validUntil: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await couponsAPI.getAllCoupons();
      setCoupons(response.data.coupons);
    } catch (error) {
      toast.error('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      type: 'percentage',
      value: '',
      minOrderAmount: '',
      maxDiscount: '',
      usageLimit: '',
      userUsageLimit: '1',
      validUntil: ''
    });
    setEditingCoupon(null);
  };

  const openModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        description: coupon.description || '',
        type: coupon.type,
        value: coupon.value.toString(),
        minOrderAmount: coupon.minOrderAmount?.toString() || '',
        maxDiscount: coupon.maxDiscount?.toString() || '',
        usageLimit: coupon.usageLimit?.toString() || '',
        userUsageLimit: coupon.userUsageLimit?.toString() || '1',
        validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : ''
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.code || !formData.value || !formData.validUntil) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        code: formData.code,
        description: formData.description,
        type: formData.type,
        value: parseFloat(formData.value),
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : 0,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        userUsageLimit: parseInt(formData.userUsageLimit) || 1,
        validUntil: new Date(formData.validUntil)
      };

      if (editingCoupon) {
        await couponsAPI.updateCoupon(editingCoupon._id, data);
        toast.success('Coupon updated successfully');
      } else {
        await couponsAPI.createCoupon(data);
        toast.success('Coupon created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchCoupons();
    } catch (error) {
      toast.error(error.message || 'Failed to save coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (couponId) => {
    try {
      await couponsAPI.toggleCouponStatus(couponId);
      toast.success('Coupon status updated');
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (couponId) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;

    try {
      await couponsAPI.deleteCoupon(couponId);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const isExpired = (date) => new Date(date) < new Date();

  return (
    <div className="manage-coupons-page">
      <div className="page-header">
        <div>
          <h1>Manage Coupons</h1>
          <p>Create and manage discount coupons</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <FiPlus /> Add Coupon
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : coupons.length === 0 ? (
        <div className="no-coupons">
          <FiTag className="no-coupons-icon" />
          <h3>No coupons yet</h3>
          <p>Create your first coupon to offer discounts to customers</p>
        </div>
      ) : (
        <div className="coupons-grid">
          {coupons.map(coupon => (
            <div key={coupon._id} className={`coupon-card ${!coupon.isActive ? 'inactive' : ''} ${isExpired(coupon.validUntil) ? 'expired' : ''}`}>
              <div className="coupon-header">
                <span className="coupon-code">{coupon.code}</span>
                <div className="coupon-actions">
                  <button onClick={() => handleToggle(coupon._id)} title={coupon.isActive ? 'Deactivate' : 'Activate'}>
                    {coupon.isActive ? <FiToggleRight className="active" /> : <FiToggleLeft />}
                  </button>
                  <button onClick={() => openModal(coupon)} title="Edit">
                    <FiEdit2 />
                  </button>
                  <button onClick={() => handleDelete(coupon._id)} title="Delete" className="delete-btn">
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              <div className="coupon-value">
                {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
              </div>

              {coupon.description && (
                <p className="coupon-desc">{coupon.description}</p>
              )}

              <div className="coupon-details">
                {coupon.minOrderAmount > 0 && (
                  <span>Min. Order: ₹{coupon.minOrderAmount}</span>
                )}
                {coupon.maxDiscount && (
                  <span>Max Discount: ₹{coupon.maxDiscount}</span>
                )}
                <span>Used: {coupon.usedCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}</span>
              </div>

              <div className="coupon-footer">
                <span className={`coupon-status ${coupon.isActive ? 'active' : 'inactive'}`}>
                  {coupon.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className={`coupon-expiry ${isExpired(coupon.validUntil) ? 'expired' : ''}`}>
                  {isExpired(coupon.validUntil) ? 'Expired' : `Expires: ${formatDate(coupon.validUntil)}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="coupon-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Coupon Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., SAVE20"
                    disabled={editingCoupon}
                  />
                </div>

                <div className="form-group">
                  <label>Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., 20% off on all orders"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Value *</label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder={formData.type === 'percentage' ? 'e.g., 20' : 'e.g., 100'}
                    min="0"
                    max={formData.type === 'percentage' ? '100' : undefined}
                  />
                </div>

                <div className="form-group">
                  <label>Min Order Amount</label>
                  <input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    placeholder="e.g., 500"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Max Discount (for %)</label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    placeholder="e.g., 200"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Valid Until *</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Total Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder="Unlimited"
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label>Per User Limit</label>
                  <input
                    type="number"
                    value={formData.userUsageLimit}
                    onChange={(e) => setFormData({ ...formData, userUsageLimit: e.target.value })}
                    placeholder="1"
                    min="1"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : (editingCoupon ? 'Update Coupon' : 'Create Coupon')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCoupons;
