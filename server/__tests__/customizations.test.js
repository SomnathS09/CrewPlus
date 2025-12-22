const request = require('supertest');
const app = require('../src/app');
const Customization = require('../src/models/Customization');
const User = require('../src/models/User');

describe('Customizations API', () => {
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

  describe('POST /api/customizations (Admin only)', () => {
    it('should create a customization as admin', async () => {
      const res = await request(app)
        .post('/api/customizations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Extra Cheese',
          type: 'topping',
          price: 50,
          isVegetarian: true,
          applicableCategories: ['pizza']
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customization.name).toBe('Extra Cheese');
      expect(res.body.data.customization.type).toBe('topping');
      expect(res.body.data.customization.price).toBe(50);
    });

    it('should create different customization types', async () => {
      const types = ['crust', 'sauce', 'cheese', 'topping', 'extra'];

      for (const type of types) {
        const res = await request(app)
          .post('/api/customizations')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: `Test ${type}`,
            type,
            price: 30,
            isVegetarian: true,
            applicableCategories: ['pizza']
          });

        expect(res.statusCode).toBe(201);
        expect(res.body.data.customization.type).toBe(type);
      }
    });

    it('should not allow regular user to create customization', async () => {
      const res = await request(app)
        .post('/api/customizations')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Extra Cheese',
          type: 'topping',
          price: 50,
          isVegetarian: true,
          applicableCategories: ['pizza']
        });

      expect(res.statusCode).toBe(403);
    });

    it('should validate customization type', async () => {
      const res = await request(app)
        .post('/api/customizations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Invalid Type',
          type: 'invalid',
          price: 50,
          isVegetarian: true,
          applicableCategories: ['pizza']
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/customizations', () => {
    beforeEach(async () => {
      await Customization.create([
        {
          name: 'Thin Crust',
          type: 'crust',
          price: 0,
          isVegetarian: true,
          isAvailable: true,
          applicableCategories: ['pizza']
        },
        {
          name: 'Extra Cheese',
          type: 'topping',
          price: 50,
          isVegetarian: true,
          isAvailable: true,
          applicableCategories: ['pizza']
        },
        {
          name: 'Pepperoni',
          type: 'topping',
          price: 70,
          isVegetarian: false,
          isAvailable: true,
          applicableCategories: ['pizza']
        },
        {
          name: 'Unavailable Topping',
          type: 'topping',
          price: 40,
          isVegetarian: true,
          isAvailable: false,
          applicableCategories: ['pizza']
        }
      ]);
    });

    it('should get all available customizations', async () => {
      const res = await request(app).get('/api/customizations');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customizations.length).toBe(3);
    });

    it('should filter by type', async () => {
      const res = await request(app)
        .get('/api/customizations')
        .query({ type: 'topping' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.customizations.every(c => c.type === 'topping')).toBe(true);
    });

    it('should filter vegetarian options', async () => {
      const res = await request(app)
        .get('/api/customizations')
        .query({ vegetarian: 'true' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.customizations.every(c => c.isVegetarian === true)).toBe(true);
    });

    it('should filter by category', async () => {
      const res = await request(app)
        .get('/api/customizations')
        .query({ category: 'pizza' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.customizations.every(c =>
        c.applicableCategories.includes('pizza')
      )).toBe(true);
    });
  });

  describe('GET /api/customizations/:id', () => {
    let customization;

    beforeEach(async () => {
      customization = await Customization.create({
        name: 'Extra Cheese',
        type: 'topping',
        price: 50,
        isVegetarian: true,
        isAvailable: true,
        applicableCategories: ['pizza']
      });
    });

    it('should get customization by ID', async () => {
      const res = await request(app).get(`/api/customizations/${customization._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customization.name).toBe('Extra Cheese');
    });

    it('should return 404 for non-existent customization', async () => {
      const res = await request(app).get('/api/customizations/507f1f77bcf86cd799439011');

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/customizations/:id (Admin only)', () => {
    let customization;

    beforeEach(async () => {
      customization = await Customization.create({
        name: 'Extra Cheese',
        type: 'topping',
        price: 50,
        isVegetarian: true,
        isAvailable: true,
        applicableCategories: ['pizza']
      });
    });

    it('should update customization as admin', async () => {
      const res = await request(app)
        .put(`/api/customizations/${customization._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Double Cheese',
          price: 75
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.customization.name).toBe('Double Cheese');
      expect(res.body.data.customization.price).toBe(75);
    });

    it('should not allow regular user to update customization', async () => {
      const res = await request(app)
        .put(`/api/customizations/${customization._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Double Cheese'
        });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('PUT /api/customizations/:id/toggle (Admin only)', () => {
    let customization;

    beforeEach(async () => {
      customization = await Customization.create({
        name: 'Extra Cheese',
        type: 'topping',
        price: 50,
        isVegetarian: true,
        isAvailable: true,
        applicableCategories: ['pizza']
      });
    });

    it('should toggle customization availability', async () => {
      const res = await request(app)
        .put(`/api/customizations/${customization._id}/toggle`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.customization.isAvailable).toBe(false);

      // Toggle again
      const res2 = await request(app)
        .put(`/api/customizations/${customization._id}/toggle`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res2.body.data.customization.isAvailable).toBe(true);
    });
  });

  describe('DELETE /api/customizations/:id (Admin only)', () => {
    let customization;

    beforeEach(async () => {
      customization = await Customization.create({
        name: 'Extra Cheese',
        type: 'topping',
        price: 50,
        isVegetarian: true,
        isAvailable: true,
        applicableCategories: ['pizza']
      });
    });

    it('should delete customization as admin', async () => {
      const res = await request(app)
        .delete(`/api/customizations/${customization._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify deletion
      const deletedCustomization = await Customization.findById(customization._id);
      expect(deletedCustomization).toBeNull();
    });

    it('should not allow regular user to delete customization', async () => {
      const res = await request(app)
        .delete(`/api/customizations/${customization._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });
  });
});
