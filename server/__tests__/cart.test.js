const request = require('supertest');
const app = require('../src/app');
const Cart = require('../src/models/Cart');
const Product = require('../src/models/Product');
const User = require('../src/models/User');

describe('Cart API', () => {
  let userToken;
  let userId;
  let product;
  const sessionId = 'test_session_123';

  beforeEach(async () => {
    // Create user
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: '1234567890'
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
        large: 399,
        extra_large: 499
      },
      category: 'pizza',
      isVegetarian: true,
      inventory: 50,
      isAvailable: true
    });
  });

  describe('GET /api/cart', () => {
    it('should get cart for authenticated user', async () => {
      const res = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .set('x-session-id', sessionId);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('cart');
    });

    it('should get cart for guest user with session ID', async () => {
      const res = await request(app)
        .get('/api/cart')
        .set('x-session-id', sessionId);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('cart');
    });

    it('should fail without session ID for guest', async () => {
      const res = await request(app).get('/api/cart');

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/cart/items', () => {
    it('should add item to cart for authenticated user', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .set('x-session-id', sessionId)
        .send({
          productId: product._id,
          quantity: 2,
          size: 'medium'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.cart.items.length).toBe(1);
      expect(res.body.data.cart.items[0].quantity).toBe(2);
      expect(res.body.data.cart.items[0].price).toBe(299);
    });

    it('should add item to cart for guest user', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('x-session-id', sessionId)
        .send({
          productId: product._id,
          quantity: 1,
          size: 'large'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.cart.items.length).toBe(1);
      expect(res.body.data.cart.items[0].price).toBe(399);
    });

    it('should increase quantity if same item added', async () => {
      // Add item first time
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .set('x-session-id', sessionId)
        .send({
          productId: product._id,
          quantity: 1,
          size: 'medium'
        });

      // Add same item again
      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .set('x-session-id', sessionId)
        .send({
          productId: product._id,
          quantity: 2,
          size: 'medium'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.cart.items.length).toBe(1);
      expect(res.body.data.cart.items[0].quantity).toBe(3);
    });

    it('should not add item if product not found', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .set('x-session-id', sessionId)
        .send({
          productId: '507f1f77bcf86cd799439011',
          quantity: 1
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should not add item if product is unavailable', async () => {
      await Product.findByIdAndUpdate(product._id, { isAvailable: false });

      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .set('x-session-id', sessionId)
        .send({
          productId: product._id,
          quantity: 1
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should not add more than available inventory', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .set('x-session-id', sessionId)
        .send({
          productId: product._id,
          quantity: 100
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/cart/items/:itemId', () => {
    let cartItemId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .set('x-session-id', sessionId)
        .send({
          productId: product._id,
          quantity: 2,
          size: 'medium'
        });

      cartItemId = res.body.data.cart.items[0]._id;
    });

    it('should update cart item quantity', async () => {
      const res = await request(app)
        .put(`/api/cart/items/${cartItemId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .set('x-session-id', sessionId)
        .send({
          quantity: 5
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.cart.items[0].quantity).toBe(5);
    });

    it('should return error for non-existent item', async () => {
      const res = await request(app)
        .put('/api/cart/items/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${userToken}`)
        .set('x-session-id', sessionId)
        .send({
          quantity: 5
        });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/cart/items/:itemId', () => {
    let cartItemId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .set('x-session-id', sessionId)
        .send({
          productId: product._id,
          quantity: 2,
          size: 'medium'
        });

      cartItemId = res.body.data.cart.items[0]._id;
    });

    it('should remove item from cart', async () => {
      const res = await request(app)
        .delete(`/api/cart/items/${cartItemId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .set('x-session-id', sessionId);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.cart.items.length).toBe(0);
    });
  });

  describe('DELETE /api/cart', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .set('x-session-id', sessionId)
        .send({
          productId: product._id,
          quantity: 2,
          size: 'medium'
        });
    });

    it('should clear cart', async () => {
      const res = await request(app)
        .delete('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .set('x-session-id', sessionId);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.cart.items.length).toBe(0);
    });
  });

  describe('POST /api/cart/merge', () => {
    const guestSessionId = 'guest_session_456';

    beforeEach(async () => {
      // Add item to guest cart
      await request(app)
        .post('/api/cart/items')
        .set('x-session-id', guestSessionId)
        .send({
          productId: product._id,
          quantity: 2,
          size: 'medium'
        });
    });

    it('should merge guest cart with user cart', async () => {
      const res = await request(app)
        .post('/api/cart/merge')
        .set('Authorization', `Bearer ${userToken}`)
        .set('x-session-id', sessionId)
        .send({
          sessionId: guestSessionId
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.cart.items.length).toBe(1);
      expect(res.body.data.cart.items[0].quantity).toBe(2);
    });

    it('should fail without session ID', async () => {
      const res = await request(app)
        .post('/api/cart/merge')
        .set('Authorization', `Bearer ${userToken}`)
        .set('x-session-id', sessionId)
        .send({});

      expect(res.statusCode).toBe(400);
    });
  });
});
