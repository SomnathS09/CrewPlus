const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Product = require('../models/Product');

const API_KEY = process.env.API_KEY || 'test-api-key';

describe('Menu API', () => {
  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crewplus-test', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/menu', () => {
    it('should return 401 without API key', async () => {
      const response = await request(app).get('/api/menu');
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 with invalid API key', async () => {
      const response = await request(app)
        .get('/api/menu')
        .set('x-api-key', 'invalid-key');
      expect(response.status).toBe(401);
    });

    it('should return menu with valid API key', async () => {
      const response = await request(app)
        .get('/api/menu')
        .set('x-api-key', API_KEY);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('pizzas');
      expect(response.body.data).toHaveProperty('drinks');
      expect(response.body.data).toHaveProperty('breads');
    });
  });
});
