import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut, FiSettings, FiPackage, FiUsers, FiTag, FiSliders } from 'react-icons/fi';
import { GiFullPizza } from 'react-icons/gi';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowDropdown(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <GiFullPizza className="brand-icon" />
          <span className="brand-text">CrewPlus</span>
        </Link>

        <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/menu"
            className={`nav-link ${isActive('/menu') ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            Menu
          </Link>
          {isAuthenticated && !isAdmin() && (
            <Link
              to="/orders"
              className={`nav-link ${isActive('/orders') ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              My Orders
            </Link>
          )}
          {isAdmin() && (
            <Link
              to="/admin"
              className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
          )}
        </div>

        <div className="navbar-actions">
          {!isAdmin() && (
            <Link to="/cart" className="cart-btn">
              <FiShoppingCart />
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </Link>
          )}

          {isAuthenticated ? (
            <div className="user-menu">
              <button
                className="user-btn"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <FiUser />
                <span className="user-name">{user?.name?.split(' ')[0]}</span>
              </button>

              {showDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <span className="dropdown-name">{user?.name}</span>
                    <span className="dropdown-role">{user?.role}</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  {isAdmin() ? (
                    <>
                      <Link
                        to="/admin"
                        className="dropdown-item"
                        onClick={() => setShowDropdown(false)}
                      >
                        <FiSettings /> Dashboard
                      </Link>
                      <Link
                        to="/admin/orders"
                        className="dropdown-item"
                        onClick={() => setShowDropdown(false)}
                      >
                        <FiPackage /> Manage Orders
                      </Link>
                      <Link
                        to="/admin/users"
                        className="dropdown-item"
                        onClick={() => setShowDropdown(false)}
                      >
                        <FiUsers /> Manage Users
                      </Link>
                      <Link
                        to="/admin/coupons"
                        className="dropdown-item"
                        onClick={() => setShowDropdown(false)}
                      >
                        <FiTag /> Manage Coupons
                      </Link>
                      <Link
                        to="/admin/customizations"
                        className="dropdown-item"
                        onClick={() => setShowDropdown(false)}
                      >
                        <FiSliders /> Customizations
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/profile"
                        className="dropdown-item"
                        onClick={() => setShowDropdown(false)}
                      >
                        <FiUser /> Profile
                      </Link>
                      <Link
                        to="/orders"
                        className="dropdown-item"
                        onClick={() => setShowDropdown(false)}
                      >
                        <FiPackage /> My Orders
                      </Link>
                    </>
                  )}
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}

          <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
