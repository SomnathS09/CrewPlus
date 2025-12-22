const mongoose = require('mongoose');
const { ORDER_STATUS, ORDER_TYPES } = require('../config/constants');

const orderCustomizationSchema = new mongoose.Schema({
  customization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customization'
  },
  name: String,
  price: Number
});

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  size: {
    type: String,
    enum: ['small', 'medium', 'large', 'extra_large'],
    default: 'medium'
  },
  price: {
    type: Number,
    required: true
  },
  customizations: [orderCustomizationSchema],
  customizationTotal: {
    type: Number,
    default: 0
  },
  notes: String
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true,
    default: () => `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: {
    type: String
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  couponCode: {
    type: String,
    default: null
  },
  total: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: Object.values(ORDER_TYPES),
    required: true
  },
  status: {
    type: String,
    enum: Object.values(ORDER_STATUS),
    default: ORDER_STATUS.PENDING
  },
  customerInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  },
  estimatedDelivery: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient querying (orderNumber already has unique: true)
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('Order').countDocuments({
      createdAt: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      }
    });
    this.orderNumber = `ORD-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Static method to get order analytics
orderSchema.statics.getAnalytics = async function(startDate, endDate) {
  const match = {};
  if (startDate && endDate) {
    match.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const analytics = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' },
        deliveryOrders: {
          $sum: { $cond: [{ $eq: ['$type', 'delivery'] }, 1, 0] }
        },
        carryoutOrders: {
          $sum: { $cond: [{ $eq: ['$type', 'carryout'] }, 1, 0] }
        }
      }
    }
  ]);

  const statusCounts = await this.aggregate([
    { $match: match },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const dailyRevenue = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return {
    summary: analytics[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      deliveryOrders: 0,
      carryoutOrders: 0
    },
    statusBreakdown: statusCounts,
    dailyRevenue
  };
};

// Static method to get popular items
orderSchema.statics.getPopularItems = async function(limit = 10) {
  return this.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        name: { $first: '$items.name' },
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: limit }
  ]);
};

module.exports = mongoose.model('Order', orderSchema);
