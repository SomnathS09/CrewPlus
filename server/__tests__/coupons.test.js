const request = require('supertest');
const app = require('../src/app');
const Coupon = require('../src/models/Coupon');
const User = require('../src/models/User');

describe('Coupons API', () => {
  let adminToken;
  let userToken;

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
      name: 'Regular User',
      email: 'user@example.com',
      password: 'password123',
      phone: '0987654321'
    });
    userToken = user.generateToken();
  });

  describe('POST /api/coupons (Admin only)', () => {
    it('should create a percentage coupon', async () => {
      const res = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'SAVE20',
          type: 'percentage',
          value: 20,
          minOrderAmount: 500,
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.coupon.code).toBe('SAVE20');
      expect(res.body.data.coupon.type).toBe('percentage');
      expect(res.body.data.coupon.value).toBe(20);
    });

    it('should create a fixed amount coupon', async () => {
      const res = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'FLAT100',
          type: 'fixed',
          value: 100,
          minOrderAmount: 300,
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.coupon.type).toBe('fixed');
      expect(res.body.data.coupon.value).toBe(100);
    });

    it('should not allow duplicate coupon codes', async () => {
      await Coupon.create({
        code: 'EXISTING',
        type: 'percentage',
        value: 10,
        minOrderAmount: 200,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true
      });

      const res = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'EXISTING',
          type: 'percentage',
          value: 15,
          minOrderAmount: 300,
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true
        });

      expect(res.statusCode).toBe(400);
    });

    it('should not allow regular user to create coupon', async () => {
      const res = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          code: 'SAVE20',
          type: 'percentage',
          value: 20,
          minOrderAmount: 500,
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true
        });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('POST /api/coupons/validate', () => {
    beforeEach(async () => {
      await Coupon.create({
        code: 'VALID20',
        type: 'percentage',
        value: 20,
        minOrderAmount: 500,
        maxDiscount: 200,
        validFrom: new Date(Date.now() - 24 * 60 * 60 * 1000),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true
      });

      await Coupon.create({
        code: 'EXPIRED',
        type: 'percentage',
        value: 15,
        minOrderAmount: 300,
        validFrom: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        validUntil: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        isActive: true
      });

      await Coupon.create({
        code: 'INACTIVE',
        type: 'percentage',
        value: 10,
        minOrderAmount: 200,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: false
      });
    });

    it('should validate active coupon with sufficient order amount', async () => {
      const res = await request(app)
        .post('/api/coupons/validate')
        .send({
          code: 'VALID20',
          subtotal: 1000
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.coupon.code).toBe('VALID20');
      expect(res.body.data.discount).toBe(200); // 20% of 1000, capped at maxDiscount
    });

    it('should reject expired coupon', async () => {
      const res = await request(app)
        .post('/api/coupons/validate')
        .send({
          code: 'EXPIRED',
          subtotal: 500
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject inactive coupon', async () => {
      const res = await request(app)
        .post('/api/coupons/validate')
        .send({
          code: 'INACTIVE',
          subtotal: 500
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject coupon when order amount is below minimum', async () => {
      const res = await request(app)
        .post('/api/coupons/validate')
        .send({
          code: 'VALID20',
          subtotal: 300
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject non-existent coupon', async () => {
      const res = await request(app)
        .post('/api/coupons/validate')
        .send({
          code: 'NONEXISTENT',
          subtotal: 500
        });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/coupons (Admin only)', () => {
    beforeEach(async () => {
      await Coupon.create([
        {
          code: 'COUPON1',
          type: 'percentage',
          value: 10,
          minOrderAmount: 200,
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true
        },
        {
          code: 'COUPON2',
          type: 'fixed',
          value: 50,
          minOrderAmount: 300,
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true
        }
      ]);
    });

    it('should get all coupons as admin', async () => {
      const res = await request(app)
        .get('/api/coupons')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.coupons.length).toBe(2);
    });

    it('should not allow regular user to get all coupons', async () => {
      const res = await request(app)
        .get('/api/coupons')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('PUT /api/coupons/:id (Admin only)', () => {
    let coupon;

    beforeEach(async () => {
      coupon = await Coupon.create({
        code: 'UPDATE',
        type: 'percentage',
        value: 10,
        minOrderAmount: 200,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true
      });
    });

    it('should update coupon as admin', async () => {
      const res = await request(app)
        .put(`/api/coupons/${coupon._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          value: 25,
          minOrderAmount: 500
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.coupon.value).toBe(25);
      expect(res.body.data.coupon.minOrderAmount).toBe(500);
    });
  });

  describe('PUT /api/coupons/:id/toggle (Admin only)', () => {
    let coupon;

    beforeEach(async () => {
      coupon = await Coupon.create({
        code: 'TOGGLE',
        type: 'percentage',
        value: 10,
        minOrderAmount: 200,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true
      });
    });

    it('should toggle coupon status', async () => {
      const res = await request(app)
        .put(`/api/coupons/${coupon._id}/toggle`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.coupon.isActive).toBe(false);

      // Toggle again
      const res2 = await request(app)
        .put(`/api/coupons/${coupon._id}/toggle`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res2.body.data.coupon.isActive).toBe(true);
    });
  });

  describe('DELETE /api/coupons/:id (Admin only)', () => {
    let coupon;

    beforeEach(async () => {
      coupon = await Coupon.create({
        code: 'DELETE',
        type: 'percentage',
        value: 10,
        minOrderAmount: 200,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true
      });
    });

    it('should delete coupon as admin', async () => {
      const res = await request(app)
        .delete(`/api/coupons/${coupon._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify deletion
      const deletedCoupon = await Coupon.findById(coupon._id);
      expect(deletedCoupon).toBeNull();
    });
  });
});
