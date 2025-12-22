import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';
// const API_URL = process.env.REACT_APP_API_URL || 
//   (process.env.NODE_ENV === 'production' 
//     ? 'https://crewplus-api.onrender.com/api' 
//     : 'http://localhost:5000/api');

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Clean up old localStorage sessionId if it exists (migration from old behavior)
if (localStorage.getItem('sessionId')) {
  localStorage.removeItem('sessionId');
}

// Get or create session ID for guest users
// Uses sessionStorage so cart resets on new browser session
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('guestSessionId');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    sessionStorage.setItem('guestSessionId', sessionId);
  }
  return sessionId;
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add session ID for cart operations
    config.headers['x-session-id'] = getSessionId();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';

    // Handle 401 errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if needed
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject({ message, errors: error.response?.data?.errors || [] });
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
  getAllUsers: (params) => api.get('/auth/users', { params }),
  createUser: (data) => api.post('/auth/users', data),
  updateUserRole: (id, role) => api.put(`/auth/users/${id}/role`, { role }),
  toggleUserStatus: (id) => api.put(`/auth/users/${id}/status`),
};

// Products API
export const productsAPI = {
  getMenu: () => api.get('/products/menu'),
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  updateInventory: (id, data) => api.put(`/products/${id}/inventory`, data),
  getAllProductsAdmin: (params) => api.get('/products/admin/all', { params }),
  getLowStockProducts: (threshold) => api.get('/products/admin/low-stock', { params: { threshold } }),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart/items', data),
  updateCartItem: (itemId, quantity) => api.put(`/cart/items/${itemId}`, { quantity }),
  removeFromCart: (itemId) => api.delete(`/cart/items/${itemId}`),
  clearCart: () => api.delete('/cart'),
  mergeCart: (sessionId) => api.post('/cart/merge', { sessionId }),
};

// Orders API
export const ordersAPI = {
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
  trackOrder: (orderNumber) => api.get(`/orders/track/${orderNumber}`),
  getAllOrders: (params) => api.get('/orders', { params }),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  getAnalytics: (params) => api.get('/orders/admin/analytics', { params }),
};

// Coupons API
export const couponsAPI = {
  validateCoupon: (code, subtotal) => api.post('/coupons/validate', { code, subtotal }),
  getAllCoupons: (params) => api.get('/coupons', { params }),
  createCoupon: (data) => api.post('/coupons', data),
  updateCoupon: (id, data) => api.put(`/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`),
  toggleCouponStatus: (id) => api.put(`/coupons/${id}/toggle`),
};

// Customizations API
export const customizationsAPI = {
  getCustomizations: (params) => api.get('/customizations', { params }),
  getCustomization: (id) => api.get(`/customizations/${id}`),
  createCustomization: (data) => api.post('/customizations', data),
  updateCustomization: (id, data) => api.put(`/customizations/${id}`, data),
  deleteCustomization: (id) => api.delete(`/customizations/${id}`),
  toggleCustomization: (id) => api.put(`/customizations/${id}/toggle`),
};

export default api;
