const mongoose = require('mongoose');
const { COUPON_TYPES } = require('../config/constants');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [20, 'Code cannot exceed 20 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  type: {
    type: String,
    enum: Object.values(COUPON_TYPES),
    required: [true, 'Coupon type is required']
  },
  value: {
    type: Number,
    required: [true, 'Coupon value is required'],
    min: [0, 'Value cannot be negative']
  },
  minOrderAmount: {
    type: Number,
    default: 0,
    min: [0, 'Minimum order amount cannot be negative']
  },
  maxDiscount: {
    type: Number,
    default: null,
    min: [0, 'Maximum discount cannot be negative']
  },
  usageLimit: {
    type: Number,
    default: null,
    min: [1, 'Usage limit must be at least 1']
  },
  usedCount: {
    type: Number,
    default: 0
  },
  userUsageLimit: {
    type: Number,
    default: 1,
    min: [1, 'User usage limit must be at least 1']
  },
  usedBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    usedAt: { type: Date, default: Date.now },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
  }],
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableCategories: [{
    type: String,
    enum: ['pizza', 'drink', 'bread']
  }]
}, {
  timestamps: true
});

// Index for efficient querying (code already has unique: true)
couponSchema.index({ isActive: 1, validUntil: 1 });

// Virtual for checking if coupon is valid
couponSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.isActive &&
         now >= this.validFrom &&
         now <= this.validUntil &&
         (this.usageLimit === null || this.usedCount < this.usageLimit);
});

// Method to check if coupon can be used by user
couponSchema.methods.canBeUsedBy = function(userId) {
  if (!this.isValid) return false;

  if (userId) {
    const userUsages = this.usedBy.filter(u => u.user.toString() === userId.toString());
    if (userUsages.length >= this.userUsageLimit) {
      return false;
    }
  }

  return true;
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function(subtotal) {
  if (subtotal < this.minOrderAmount) {
    return 0;
  }

  let discount = 0;

  if (this.type === COUPON_TYPES.PERCENTAGE) {
    discount = (subtotal * this.value) / 100;
  } else {
    discount = this.value;
  }

  // Apply max discount cap if set
  if (this.maxDiscount !== null && discount > this.maxDiscount) {
    discount = this.maxDiscount;
  }

  // Ensure discount doesn't exceed subtotal
  if (discount > subtotal) {
    discount = subtotal;
  }

  return Math.round(discount * 100) / 100;
};

// Method to mark coupon as used
couponSchema.methods.markAsUsed = async function(userId, orderId) {
  this.usedCount += 1;
  this.usedBy.push({
    user: userId,
    orderId: orderId,
    usedAt: new Date()
  });
  return this.save();
};

module.exports = mongoose.model('Coupon', couponSchema);
