const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/menu - Get all products categorized
router.get('/', async (req, res, next) => {
  try {
    const products = await Product.find();
    
    const menu = {
      pizzas: products.filter(p => p.category === 'Pizza'),
      drinks: products.filter(p => p.category === 'Cold Drink'),
      breads: products.filter(p => p.category === 'Bread')
    };
    
    res.json({
      success: true,
      data: menu
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
