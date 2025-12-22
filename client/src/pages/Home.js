import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import ProductCard from '../components/menu/ProductCard';
import Loading from '../components/common/Loading';
import { FiTruck, FiClock, FiAward, FiPhoneCall } from 'react-icons/fi';
import { GiFullPizza, GiHotMeal, GiSodaCan } from 'react-icons/gi';
import './Home.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await productsAPI.getMenu();
        const allProducts = [
          ...response.data.menu.pizzas.slice(0, 4),
        ];
        setFeaturedProducts(allProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const features = [
    {
      icon: <FiTruck />,
      title: 'Fast Delivery',
      description: 'Hot pizza delivered to your door in 30 mins or less'
    },
    {
      icon: <FiClock />,
      title: 'Open Late',
      description: 'We serve till midnight, every day of the week'
    },
    {
      icon: <FiAward />,
      title: 'Best Quality',
      description: 'Premium ingredients for the perfect taste'
    },
    {
      icon: <FiPhoneCall />,
      title: '24/7 Support',
      description: 'Questions? Our team is here to help anytime'
    }
  ];

  const categories = [
    {
      icon: <GiFullPizza />,
      name: 'Pizzas',
      description: 'Classic & specialty pizzas',
      link: '/menu?category=pizza',
      color: '#e53935'
    },
    {
      icon: <GiSodaCan />,
      name: 'Drinks',
      description: 'Cold beverages & refreshments',
      link: '/menu?category=drink',
      color: '#1976d2'
    },
    {
      icon: <GiHotMeal />,
      name: 'Breads',
      description: 'Garlic bread & sides',
      link: '/menu?category=bread',
      color: '#f57c00'
    }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Delicious Pizza
            <span className="highlight">Delivered Hot</span>
          </h1>
          <p className="hero-subtitle">
            Experience the authentic taste of handcrafted pizzas made with fresh
            ingredients and baked to perfection in our wood-fired ovens.
          </p>
          <div className="hero-actions">
            <Link to="/menu" className="btn btn-primary btn-lg">
              Order Now
            </Link>
            <Link to="/menu" className="btn btn-outline btn-lg">
              View Menu
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600"
            alt="Delicious Pizza"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="features section">
        <div className="container">
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories section">
        <div className="container">
          <h2 className="section-title">Explore Our Menu</h2>
          <p className="section-subtitle">
            Choose from our wide variety of delicious options
          </p>
          <div className="categories-grid">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={category.link}
                className="category-card"
                style={{ '--category-color': category.color }}
              >
                <div className="category-icon">{category.icon}</div>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured section">
        <div className="container">
          <h2 className="section-title">Popular Pizzas</h2>
          <p className="section-subtitle">
            Our most loved pizzas that keep customers coming back
          </p>
          {loading ? (
            <Loading />
          ) : (
            <div className="products-grid grid grid-4">
              {featuredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
          <div className="section-footer">
            <Link to="/menu" className="btn btn-primary btn-lg">
              View All Menu
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta section">
        <div className="container">
          <div className="cta-content">
            <h2>Hungry? Order Your Favorite Pizza Now!</h2>
            <p>Get 10% off on your first order. Use code: FIRST10</p>
            <Link to="/menu" className="btn btn-secondary btn-lg">
              Order Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
