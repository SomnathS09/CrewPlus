import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await updateProfile({
      name: profileData.name,
      phone: profileData.phone,
      address: {
        street: profileData.street,
        city: profileData.city,
        state: profileData.state,
        zipCode: profileData.zipCode
      }
    });

    setLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrors({ newPassword: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    const result = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });

    if (result.success) {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
    setLoading(false);
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p>Manage your account settings</p>
        </div>

        <div className="profile-layout">
          <aside className="profile-sidebar">
            <div className="user-card">
              <div className="user-avatar">
                <FiUser />
              </div>
              <h3>{user?.name}</h3>
              <span className="user-email">{user?.email}</span>
              <span className="user-role">{user?.role}</span>
            </div>

            <nav className="profile-nav">
              <button
                className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <FiUser /> Profile Info
              </button>
              <button
                className={`nav-btn ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                <FiLock /> Change Password
              </button>
            </nav>
          </aside>

          <main className="profile-content">
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="profile-form">
                <h2>Profile Information</h2>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      <FiUser /> Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      value={profileData.name}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <FiMail /> Email
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      value={user?.email}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <FiPhone /> Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-input"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <h3 className="section-title">
                  <FiMapPin /> Delivery Address
                </h3>

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Street Address</label>
                    <input
                      type="text"
                      name="street"
                      className="form-input"
                      value={profileData.street}
                      onChange={handleProfileChange}
                      placeholder="Enter street address"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      className="form-input"
                      value={profileData.city}
                      onChange={handleProfileChange}
                      placeholder="Enter city"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      name="state"
                      className="form-input"
                      value={profileData.state}
                      onChange={handleProfileChange}
                      placeholder="Enter state"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Zip Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      className="form-input"
                      value={profileData.zipCode}
                      onChange={handleProfileChange}
                      placeholder="Enter zip code"
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            )}

            {activeTab === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="profile-form">
                <h2>Change Password</h2>

                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    className="form-input"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    className={`form-input ${errors.newPassword ? 'error' : ''}`}
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  {errors.newPassword && <span className="form-error">{errors.newPassword}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <FiLock /> {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
