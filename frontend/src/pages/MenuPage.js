import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import CartPage from '../components/CartPage';
import OrderConfirmation from '../components/OrderConfirmation';
import { menuService, cartService, orderService } from '../services/api';
import { getSessionId } from '../utils/helpers';
import './MenuPage.css';

const MenuPage = () => {
  const [menu, setMenu] = useState({ pizzas: [], drinks: [], breads: [] });
  const [cart, setCart] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sessionId = getSessionId();

  useEffect(() => {
    loadMenu();
    loadCart();
  }, []);

  const loadMenu = async () => {
    try {
      setLoading(true);
      const response = await menuService.getMenu();
      setMenu(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load menu. Please try again later.');
      console.error('Error loading menu:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    try {
      const response = await cartService.getCart(sessionId);
      setCart(response.data);
    } catch (err) {
      console.error('Error loading cart:', err);
    }
  };

  const handleAddToCart = async (productId, quantity) => {
    try {
      const response = await cartService.addToCart(sessionId, productId, quantity);
      setCart(response.data);
      alert('Added to cart!');
    } catch (err) {
      throw err;
    }
  };

  const handleCheckout = async (orderType) => {
    try {
      const items = cart.items.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity
      }));

      const response = await orderService.placeOrder(sessionId, items, orderType);
      setOrderConfirmation(response.data);
      setShowCart(false);
      setShowConfirmation(true);
      setCart(null);
      
      // Reload menu to update inventory
      await loadMenu();
    } catch (err) {
      throw err;
    }
  };

  const getCartItemCount = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((count, item) => count + item.quantity, 0);
  };

  if (loading) {
    return <div className="loading">Loading menu...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="menu-page">
      <header className="header">
        <h1>CrewPlus Retail Portal</h1>
        <button onClick={() => setShowCart(true)} className="cart-btn">
          🛒 Cart ({getCartItemCount()})
        </button>
      </header>

      <main className="menu-content">
        <section className="menu-section">
          <h2>Pizzas</h2>
          <div className="product-grid">
            {menu.pizzas.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </section>

        <section className="menu-section">
          <h2>Cold Drinks</h2>
          <div className="product-grid">
            {menu.drinks.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </section>

        <section className="menu-section">
          <h2>Breads</h2>
          <div className="product-grid">
            {menu.breads.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </section>
      </main>

      {showCart && (
        <CartPage
          cart={cart}
          onClose={() => setShowCart(false)}
          onCheckout={handleCheckout}
        />
      )}

      {showConfirmation && orderConfirmation && (
        <OrderConfirmation
          order={orderConfirmation}
          onClose={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
};

export default MenuPage;
