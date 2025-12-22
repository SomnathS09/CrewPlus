import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const { isAuthenticated } = useAuth();

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await cartAPI.getCart();
      setCart(response.data.cart);
      calculateItemCount(response.data.cart);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateItemCount = (cartData) => {
    if (!cartData || !cartData.items) {
      setItemCount(0);
      return;
    }
    const count = cartData.items.reduce((sum, item) => sum + item.quantity, 0);
    setItemCount(count);
  };

  useEffect(() => {
    fetchCart();
  }, [fetchCart, isAuthenticated]);

  const addToCart = async (productId, quantity = 1, size = 'medium', customizations = [], notes = '') => {
    try {
      setLoading(true);
      const response = await cartAPI.addToCart({ productId, quantity, size, customizations, notes });
      setCart(response.data.cart);
      calculateItemCount(response.data.cart);
      toast.success('Added to cart!');
      return { success: true };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      setLoading(true);
      const response = await cartAPI.updateCartItem(itemId, quantity);
      setCart(response.data.cart);
      calculateItemCount(response.data.cart);
      return { success: true };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      const response = await cartAPI.removeFromCart(itemId);
      setCart(response.data.cart);
      calculateItemCount(response.data.cart);
      toast.success('Item removed from cart');
      return { success: true };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await cartAPI.clearCart();
      setCart({ items: [], subtotal: 0, tax: 0, total: 0 });
      setItemCount(0);
      return { success: true };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const refreshCart = () => {
    fetchCart();
  };

  const value = {
    cart,
    loading,
    itemCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
