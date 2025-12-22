const request = require('supertest');
const app = require('../src/app');
const Order = require('../src/models/Order');
const Cart = require('../src/models/Cart');
const Product = require('../src/models/Product');
const User = require('../src/models/User');

describe('Orders API', () => {
  let adminToken;
  let userToken;
  let userId;
  let product;
  const sessionId = 'test_session_123';

  beforeEach(async () => {
    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      phone: '1234567890',
      role: 'admin'
    });
    adminToken = admin.generateToken();

    // Create regular user
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: '0987654321'
    });
    userId = user._id;
    userToken = user.generateToken();

    // Create product
    product = await Product.create({
      name: 'Margherita Pizza',
      description: 'Classic pizza',
      price: 299,
      prices: {
        small: 199,
        medium: 299,
        large: 399
      },
      category: 'pizza',
      isVegetarian: true,
      inventory: 50,
      isAvailable: true
    });
  });

  async function addItemToCart(token, sessionIdHeader) {
    return request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .set('x-session-id', sessionIdHeader)
      .send({
        productId: product._id,
        quantity: 2,
        size: 'medium'
      });
  }

  describe('POST /api/orders', () => {
    beforeEach(async () => {
      await addItemToCart(userToken, sessionId);
    });

    it('should create order for authenticated user', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .set('x-session-id', sessionId)
        .send({
          type: 'delivery',
          customerInfo: {
            name: 'Test User',
            email: 'test@example.com',
            phone: '1234567890'
          },
          deliveryAddress: {
            street: '123 Main St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345'
          },
          paymentMethod: 'cash'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order).toHaveProperty('orderNumber');
      expect(res.body.data.order.items.length).toBe(1);
      expect(res.body.data.order.status).toBe('pending');

      // Verify inventory was reduced
      const updatedProduct = await Product.findById(product._id);
      expect(updatedProduct.inventory).toBe(48);
    });

    it('should create order for guest user', async () => {
      const guestSessionId = 'guest_session_456';
      await request(app)
        .post('/api/cart/items')
        .set('x-session-id', guestSessionId)
        .send({
          productId: product._id,
          quantity: 1,
          size: 'medium'
        });

      const res = await request(app)
        .post('/api/orders')
        .set('x-session-id', guestSessionId)
        .send({
          type: 'carryout',
          customerInfo: {
            name: 'Guest User',
            email: 'guest@example.com',
            phone: '1234567890'
          },
          paymentMethod: 'cash'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order.type).toBe('carryout');
    });

    it('should fail with empty cart', async () => {
      // Clear cart first
      await request(app)
        .delete('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .set('x-session-id', sessionId);

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .set('x-session-id', sessionId)
        .send({
          type: 'delivery',
          customerInfo: {
            name: 'Test User',
            email: 'test@example.com',
            phone: '1234567890'
          },
          deliveryAddress: {
            street: '123 Main St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345'
          },
          paymentMethod: 'cash'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail when product has insufficient stock', async () => {
      await Product.findByIdAndUpdate(product._id, { inventory: 1 });

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .set('x-session-id', sessionId)
        .send({
          type: 'delivery',
          customerInfo: {
            name: 'Test User',
            email: 'test@example.com',
            phone: '1234567890'
          },
          deliveryAddress: {
            street: '123 Main St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345'
          },
          paymentMethod: 'cash'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/orders/my-orders', () => {
    beforeEach(async () => {
      await Order.create({
        user: userId,
        orderNumber: 'ORD-001',
        items: [{
          product: product._id,
          name: product.name,
          quantity: 2,
          size: 'medium',
          price: 299
        }],
        subtotal: 598,
        tax: 59.8,
        total: 657.8,
        type: 'delivery',
        status: 'pending',
        customerInfo: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '1234567890'
        }
      });
    });

    it('should get user orders', async () => {
      const res = await request(app)
        .get('/api/orders/my-orders')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orders.length).toBe(1);
      expect(res.body.data.orders[0].orderNumber).toBe('ORD-001');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/orders/my-orders');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/orders/:id', () => {
    let order;

    beforeEach(async () => {
      order = await Order.create({
        user: userId,
        orderNumber: 'ORD-001',
        items: [{
          product: product._id,
          name: product.name,
          quantity: 2,
          size: 'medium',
          price: 299
        }],
        subtotal: 598,
        tax: 59.8,
        total: 657.8,
        type: 'delivery',
        status: 'pending',
        customerInfo: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '1234567890'
        }
      });
    });

    it('should get order by ID for owner', async () => {
      const res = await request(app)
        .get(`/api/orders/${order._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order.orderNumber).toBe('ORD-001');
    });

    it('should get order by ID for admin', async () => {
      const res = await request(app)
        .get(`/api/orders/${order._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/orders/track/:orderNumber', () => {
    beforeEach(async () => {
      await Order.create({
        user: userId,
        orderNumber: 'ORD-TRACK-001',
        items: [{
          product: product._id,
          name: product.name,
          quantity: 2,
          size: 'medium',
          price: 299
        }],
        subtotal: 598,
        tax: 59.8,
        total: 657.8,
        type: 'delivery',
        status: 'confirmed',
        customerInfo: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '1234567890'
        }
      });
    });

    it('should track order by order number', async () => {
      const res = await request(app)
        .get('/api/orders/track/ORD-TRACK-001');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order.orderNumber).toBe('ORD-TRACK-001');
      expect(res.body.data.order.status).toBe('confirmed');
    });

    it('should return 404 for non-existent order', async () => {
      const res = await request(app)
        .get('/api/orders/track/NON-EXISTENT');

      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/orders (Admin only)', () => {
    beforeEach(async () => {
      await Order.create([
        {
          user: userId,
          orderNumber: 'ORD-001',
          items: [{
            product: product._id,
            name: product.name,
            quantity: 2,
            size: 'medium',
            price: 299
          }],
          subtotal: 598,
          tax: 59.8,
          total: 657.8,
          type: 'delivery',
          status: 'pending',
          customerInfo: {
            name: 'Test User',
            email: 'test@example.com',
            phone: '1234567890'
          }
        },
        {
          user: userId,
          orderNumber: 'ORD-002',
          items: [{
            product: product._id,
            name: product.name,
            quantity: 1,
            size: 'large',
            price: 399
          }],
          subtotal: 399,
          tax: 39.9,
          total: 438.9,
          type: 'carryout',
          status: 'confirmed',
          customerInfo: {
            name: 'Test User',
            email: 'test@example.com',
            phone: '1234567890'
          }
        }
      ]);
    });

    it('should get all orders as admin', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orders.length).toBe(2);
    });

    it('should filter orders by status', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ status: 'pending' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.orders.length).toBe(1);
      expect(res.body.data.orders[0].status).toBe('pending');
    });

    it('should not allow regular user to get all orders', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('PUT /api/orders/:id/status (Admin only)', () => {
    let order;

    beforeEach(async () => {
      order = await Order.create({
        user: userId,
        orderNumber: 'ORD-STATUS-001',
        items: [{
          product: product._id,
          name: product.name,
          quantity: 2,
          size: 'medium',
          price: 299
        }],
        subtotal: 598,
        tax: 59.8,
        total: 657.8,
        type: 'delivery',
        status: 'pending',
        customerInfo: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '1234567890'
        }
      });
    });

    it('should update order status as admin', async () => {
      const res = await request(app)
        .put(`/api/orders/${order._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'confirmed' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order.status).toBe('confirmed');
    });

    it('should not allow invalid status transition', async () => {
      const res = await request(app)
        .put(`/api/orders/${order._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'delivered' });

      expect(res.statusCode).toBe(400);
    });

    it('should restore inventory on cancellation', async () => {
      // First reduce inventory
      await Product.findByIdAndUpdate(product._id, { inventory: 48 });

      const res = await request(app)
        .put(`/api/orders/${order._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'cancelled' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.order.status).toBe('cancelled');

      // Verify inventory was restored
      const updatedProduct = await Product.findById(product._id);
      expect(updatedProduct.inventory).toBe(50);
    });
  });

  describe('PUT /api/orders/:id/cancel', () => {
    let order;

    beforeEach(async () => {
      order = await Order.create({
        user: userId,
        orderNumber: 'ORD-CANCEL-001',
        items: [{
          product: product._id,
          name: product.name,
          quantity: 2,
          size: 'medium',
          price: 299
        }],
        subtotal: 598,
        tax: 59.8,
        total: 657.8,
        type: 'delivery',
        status: 'pending',
        customerInfo: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '1234567890'
        }
      });
    });

    it('should allow user to cancel own order', async () => {
      const res = await request(app)
        .put(`/api/orders/${order._id}/cancel`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.order.status).toBe('cancelled');
    });

    it('should not allow cancelling order in preparing status', async () => {
      await Order.findByIdAndUpdate(order._id, { status: 'preparing' });

      const res = await request(app)
        .put(`/api/orders/${order._id}/cancel`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(400);
    });
  });
});
