import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiTwitter, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { GiFullPizza } from 'react-icons/gi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <GiFullPizza className="footer-logo-icon" />
              <span>CrewPlus</span>
            </Link>
            <p className="footer-desc">
              Crafting the perfect pizza experience since 2025. Fresh ingredients,
              authentic recipes, and a passion for great food.
            </p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Facebook">
                <FiFacebook />
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <FiInstagram />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <FiTwitter />
              </a>
            </div>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/menu">Menu</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/track">Track Order</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Categories</h4>
            <ul>
              <li><Link to="/menu?category=pizza">Pizzas</Link></li>
              <li><Link to="/menu?category=drink">Drinks</Link></li>
              <li><Link to="/menu?category=bread">Breads</Link></li>
              <li><Link to="/menu?isVegetarian=true">Vegetarian</Link></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4>Contact Us</h4>
            <ul>
              <li>
                <FiMapPin />
                <span>IIT Jodhpur, N.H. 62, Nagaur Road, Karwar, Jodhpur, 342030</span>
              </li>
              <li>
                <FiPhone />
                <span>+1 9999999999</span>
              </li>
              <li>
                <FiMail />
                <span>contact@example.org</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} CrewPlus Pizza. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
