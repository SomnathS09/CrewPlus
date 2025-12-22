const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { ORDER_STATUS } = require('../config/constants');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (session-based) / Private (user-based)
const createOrder = asyncHandler(async (req, res) => {
  const { type, customerInfo, deliveryAddress, paymentMethod, notes } = req.body;
  const userId = req.user?._id;
  const sessionId = req.headers['x-session-id'];

  if (!userId && !sessionId) {
    throw ApiError.badRequest('Session ID required for guest orders');
  }

  // Find cart
  let cart;
  if (userId) {
    cart = await Cart.findOne({ user: userId }).populate('items.product');
  } else {
    cart = await Cart.findOne({ sessionId }).populate('items.product');
  }

  if (!cart || cart.items.length === 0) {
    throw ApiError.badRequest('Cart is empty');
  }

  // Validate inventory for all items
  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);
    if (!product.hasStock(item.quantity)) {
      throw ApiError.badRequest(
        `Insufficient stock for ${item.product.name}. Available: ${product.inventory}`
      );
    }
  }

  // Calculate delivery fee
  const deliveryFee = type === 'delivery' ? 50 : 0;

  // Create order items
  const orderItems = cart.items.map(item => ({
    product: item.product._id,
    name: item.product.name,
    quantity: item.quantity,
    size: item.size,
    price: item.price,
    notes: item.notes
  }));

  // Create order
  const order = await Order.create({
    user: userId,
    sessionId: userId ? undefined : sessionId,
    items: orderItems,
    subtotal: cart.subtotal,
    tax: cart.tax,
    deliveryFee,
    total: cart.total + deliveryFee,
    type,
    customerInfo,
    deliveryAddress: type === 'delivery' ? deliveryAddress : undefined,
    paymentMethod,
    notes,
    estimatedDelivery: new Date(Date.now() + (type === 'delivery' ? 45 : 20) * 60000)
  });

  // Deduct inventory
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { inventory: -item.quantity }
    });
  }

  // Clear cart
  await cart.clearCart();

  // Populate order details
  const populatedOrder = await Order.findById(order._id).populate('items.product');

  ApiResponse.created({
    order: populatedOrder
  }, 'Order placed successfully').send(res);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.product');

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  // Check authorization
  if (req.user.role !== 'admin' &&
      order.user?.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to view this order');
  }

  ApiResponse.success({ order }).send(res);
});

// @desc    Get user's orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = { user: req.user._id };
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('items.product')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Order.countDocuments(query)
  ]);

  ApiResponse.success({
    orders,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  }).send(res);
});

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, type, startDate, endDate, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status;
  if (type) query.type = type;
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('user', 'name email')
      .populate('items.product')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Order.countDocuments(query)
  ]);

  ApiResponse.success({
    orders,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  }).send(res);
});

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  // Validate status transition
  const validTransitions = {
    [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.PREPARING]: [ORDER_STATUS.READY, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.READY]: [ORDER_STATUS.DELIVERED],
    [ORDER_STATUS.DELIVERED]: [],
    [ORDER_STATUS.CANCELLED]: []
  };

  if (!validTransitions[order.status]?.includes(status)) {
    throw ApiError.badRequest(
      `Cannot transition from ${order.status} to ${status}`
    );
  }

  order.status = status;

  if (status === ORDER_STATUS.DELIVERED) {
    order.completedAt = new Date();
    order.paymentStatus = 'paid';
  }

  // If cancelled, restore inventory
  if (status === ORDER_STATUS.CANCELLED) {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { inventory: item.quantity }
      });
    }
  }

  await order.save();

  ApiResponse.success({ order }, 'Order status updated').send(res);
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  // Check authorization
  if (req.user.role !== 'admin' &&
      order.user?.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to cancel this order');
  }

  // Can only cancel pending or confirmed orders
  if (![ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED].includes(order.status)) {
    throw ApiError.badRequest('Order cannot be cancelled at this stage');
  }

  order.status = ORDER_STATUS.CANCELLED;

  // Restore inventory
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { inventory: item.quantity }
    });
  }

  await order.save();

  ApiResponse.success({ order }, 'Order cancelled successfully').send(res);
});

// @desc    Get order analytics (Admin only)
// @route   GET /api/orders/analytics
// @access  Private/Admin
const getOrderAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const analytics = await Order.getAnalytics(startDate, endDate);
  const popularItems = await Order.getPopularItems(10);

  // Get recent orders count by status
  const recentOrdersByStatus = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  ApiResponse.success({
    analytics,
    popularItems,
    recentOrdersByStatus
  }).send(res);
});

// @desc    Get order by order number (for tracking)
// @route   GET /api/orders/track/:orderNumber
// @access  Public
const trackOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber })
    .select('orderNumber status type estimatedDelivery createdAt items.name items.quantity');

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  ApiResponse.success({ order }).send(res);
});

module.exports = {
  createOrder,
  getOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getOrderAnalytics,
  trackOrder
};
