const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const API_KEY = process.env.REACT_APP_API_KEY || 'your-secret-api-key-here';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'x-api-key': API_KEY
});

export const menuService = {
  getMenu: async () => {
    const response = await fetch(`${API_URL}/menu`, {
      headers: getHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch menu');
    }
    return response.json();
  }
};

export const cartService = {
  getCart: async (sessionId) => {
    const response = await fetch(`${API_URL}/cart/${sessionId}`, {
      headers: getHeaders()
    });
    if (!response.ok) {
      if (response.status === 404) {
        return { success: true, data: { items: [] } };
      }
      throw new Error('Failed to fetch cart');
    }
    return response.json();
  },
  
  addToCart: async (sessionId, productId, quantity) => {
    const response = await fetch(`${API_URL}/cart`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ sessionId, productId, quantity })
    });
    if (!response.ok) {
      throw new Error('Failed to add to cart');
    }
    return response.json();
  }
};

export const orderService = {
  placeOrder: async (sessionId, items, type) => {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ sessionId, items, type })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to place order');
    }
    return response.json();
  },
  
  getOrders: async (sessionId) => {
    const response = await fetch(`${API_URL}/orders?sessionId=${sessionId}`, {
      headers: getHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    return response.json();
  }
};
