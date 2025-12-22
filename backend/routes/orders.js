const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { orderLimiter } = require('../middleware/rateLimiter');

// Generate order number
const generateOrderNumber = () => {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${dateStr}-${random}`;
};

// POST /api/orders - Place order (with stricter rate limiting)
router.post('/', orderLimiter, [
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

    // Fetch all products in a single query to avoid N+1 problem
    const productIds = items.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    
    // Create a map for quick lookup
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    // Validate all products exist and have sufficient inventory
    for (const item of items) {
      const product = productMap.get(item.productId);
      
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

      // Add to order items
      orderItems.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price
      });

      total += product.price * item.quantity;
    }

    // Deduct inventory atomically to prevent race conditions
    for (const item of items) {
      const result = await Product.findOneAndUpdate(
        { 
          _id: item.productId,
          inventory: { $gte: item.quantity } // Ensure inventory is still sufficient
        },
        { 
          $inc: { inventory: -item.quantity } 
        },
        { new: true }
      );

      // If update failed, inventory was insufficient (race condition occurred)
      if (!result) {
        const product = productMap.get(item.productId);
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient inventory for ${product.name}. Please try again.` 
        });
      }
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
