const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Generate order number
const generateOrderNumber = () => {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${dateStr}-${random}`;
};

// POST /api/orders - Place order
router.post('/', [
  body('sessionId').notEmpty().withMessage('Session ID is required'),
  body('items').isArray({ min: 1 }).withMessage('Items must be a non-empty array'),
  body('type').isIn(['delivery', 'carryout']).withMessage('Type must be delivery or carryout')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { sessionId, items, type } = req.body;

    // Validate and process items
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: `Product ${item.productId} not found` 
        });
      }

      if (product.inventory < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient inventory for ${product.name}` 
        });
      }

      // Deduct inventory
      product.inventory -= item.quantity;
      await product.save();

      // Add to order items
      orderItems.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price
      });

      total += product.price * item.quantity;
    }

    // Create order
    const order = new Order({
      orderNumber: generateOrderNumber(),
      sessionId,
      items: orderItems,
      total,
      type,
      status: 'confirmed'
    });

    await order.save();

    // Clear cart
    await Cart.findOneAndDelete({ sessionId });

    res.status(201).json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders - Get all orders (for a session or user)
router.get('/', async (req, res, next) => {
  try {
    const { sessionId, userId } = req.query;
    
    let query = {};
    if (sessionId) {
      query.sessionId = sessionId;
    }
    if (userId) {
      query.userId = userId;
    }

    const orders = await Order.find(query)
      .populate('items.productId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
