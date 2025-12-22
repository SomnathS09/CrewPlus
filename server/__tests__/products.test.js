const request = require('supertest');
const app = require('../src/app');
const Product = require('../src/models/Product');
const User = require('../src/models/User');

describe('Products API', () => {
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
      phone: '0987654321',
      role: 'customer'
    });
    userToken = user.generateToken();
  });

  describe('GET /api/products/menu', () => {
    beforeEach(async () => {
      await Product.create([
        {
          name: 'Margherita Pizza',
          description: 'Classic pizza',
          price: 299,
          category: 'pizza',
          isVegetarian: true,
          inventory: 50,
          isAvailable: true
        },
        {
          name: 'Pepperoni Pizza',
          description: 'Pepperoni pizza',
          price: 399,
          category: 'pizza',
          isVegetarian: false,
          inventory: 50,
          isAvailable: true
        },
        {
          name: 'Cola',
          description: 'Refreshing drink',
          price: 99,
          category: 'drink',
          isVegetarian: true,
          inventory: 100,
          isAvailable: true
        }
      ]);
    });

    it('should get menu grouped by category', async () => {
      const res = await request(app).get('/api/products/menu');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('menu');
      expect(res.body.data.menu).toHaveProperty('pizza');
      expect(res.body.data.menu).toHaveProperty('drink');
      expect(res.body.data.menu.pizza.length).toBe(2);
      expect(res.body.data.menu.drink.length).toBe(1);
    });

    it('should only return available products', async () => {
      await Product.create({
        name: 'Unavailable Pizza',
        description: 'Not available',
        price: 499,
        category: 'pizza',
        isVegetarian: true,
        inventory: 0,
        isAvailable: false
      });

      const res = await request(app).get('/api/products/menu');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.menu.pizza.length).toBe(2);
    });
  });

  describe('GET /api/products', () => {
    beforeEach(async () => {
      await Product.create([
        {
          name: 'Margherita Pizza',
          description: 'Classic pizza',
          price: 299,
          category: 'pizza',
          isVegetarian: true,
          inventory: 50,
          isAvailable: true
        },
        {
          name: 'Pepperoni Pizza',
          description: 'Pepperoni pizza',
          price: 399,
          category: 'pizza',
          isVegetarian: false,
          inventory: 50,
          isAvailable: true
        }
      ]);
    });

    it('should get all products', async () => {
      const res = await request(app).get('/api/products');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.products.length).toBe(2);
    });

    it('should filter products by category', async () => {
      await Product.create({
        name: 'Cola',
        description: 'Drink',
        price: 99,
        category: 'drink',
        isVegetarian: true,
        inventory: 100
      });

      const res = await request(app)
        .get('/api/products')
        .query({ category: 'pizza' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.products.length).toBe(2);
      expect(res.body.data.products.every(p => p.category === 'pizza')).toBe(true);
    });

    it('should filter vegetarian products', async () => {
      const res = await request(app)
        .get('/api/products')
        .query({ vegetarian: 'true' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.products.every(p => p.isVegetarian === true)).toBe(true);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get a single product by ID', async () => {
      const product = await Product.create({
        name: 'Margherita Pizza',
        description: 'Classic pizza',
        price: 299,
        category: 'pizza',
        isVegetarian: true,
        inventory: 50
      });

      const res = await request(app).get(`/api/products/${product._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.product).toHaveProperty('name', 'Margherita Pizza');
    });

    it('should return 404 for non-existent product', async () => {
      const res = await request(app).get('/api/products/507f1f77bcf86cd799439011');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/products (Admin only)', () => {
    it('should create product as admin', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Pizza',
          description: 'Delicious new pizza',
          price: 349,
          category: 'pizza',
          isVegetarian: true,
          inventory: 50
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.product).toHaveProperty('name', 'New Pizza');
    });

    it('should not allow regular user to create product', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'New Pizza',
          description: 'Delicious new pizza',
          price: 349,
          category: 'pizza',
          isVegetarian: true,
          inventory: 50
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/products/:id (Admin only)', () => {
    let product;

    beforeEach(async () => {
      product = await Product.create({
        name: 'Original Pizza',
        description: 'Original description',
        price: 299,
        category: 'pizza',
        isVegetarian: true,
        inventory: 50
      });
    });

    it('should update product as admin', async () => {
      const res = await request(app)
        .put(`/api/products/${product._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Pizza',
          price: 399
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.product).toHaveProperty('name', 'Updated Pizza');
      expect(res.body.data.product).toHaveProperty('price', 399);
    });

    it('should not allow regular user to update product', async () => {
      const res = await request(app)
        .put(`/api/products/${product._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Updated Pizza'
        });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('DELETE /api/products/:id (Admin only)', () => {
    let product;

    beforeEach(async () => {
      product = await Product.create({
        name: 'To Delete Pizza',
        description: 'Will be deleted',
        price: 299,
        category: 'pizza',
        isVegetarian: true,
        inventory: 50
      });
    });

    it('should delete product as admin', async () => {
      const res = await request(app)
        .delete(`/api/products/${product._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify product is deleted
      const deletedProduct = await Product.findById(product._id);
      expect(deletedProduct).toBeNull();
    });

    it('should not allow regular user to delete product', async () => {
      const res = await request(app)
        .delete(`/api/products/${product._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/products/admin/low-stock (Admin only)', () => {
    beforeEach(async () => {
      await Product.create([
        {
          name: 'Low Stock Pizza',
          description: 'Running low',
          price: 299,
          category: 'pizza',
          isVegetarian: true,
          inventory: 5
        },
        {
          name: 'Well Stocked Pizza',
          description: 'Plenty in stock',
          price: 399,
          category: 'pizza',
          isVegetarian: true,
          inventory: 100
        }
      ]);
    });

    it('should get low stock products as admin', async () => {
      const res = await request(app)
        .get('/api/products/admin/low-stock')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ threshold: 10 });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.products.length).toBe(1);
      expect(res.body.data.products[0]).toHaveProperty('name', 'Low Stock Pizza');
    });

    it('should not allow regular user to access low stock', async () => {
      const res = await request(app)
        .get('/api/products/admin/low-stock')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });
  });
});
