const mongoose = require('mongoose');
const { CATEGORIES, SIZES } = require('../config/constants');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    enum: Object.values(CATEGORIES),
    required: [true, 'Category is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  prices: {
    small: { type: Number, min: 0 },
    medium: { type: Number, min: 0 },
    large: { type: Number, min: 0 },
    extra_large: { type: Number, min: 0 }
  },
  inventory: {
    type: Number,
    required: [true, 'Inventory is required'],
    min: [0, 'Inventory cannot be negative'],
    default: 0
  },
  imageUrl: {
    type: String,
    default: ''
  },
  ingredients: [{
    type: String,
    trim: true
  }],
  isVegetarian: {
    type: Boolean,
    default: false
  },
  isSpicy: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for efficient querying
productSchema.index({ category: 1, isAvailable: 1 });
productSchema.index({ name: 'text', description: 'text' });

// Virtual for checking if in stock
productSchema.virtual('inStock').get(function() {
  return this.inventory > 0 && this.isAvailable;
});

// Method to check if enough inventory
productSchema.methods.hasStock = function(quantity) {
  return this.inventory >= quantity;
};

// Method to deduct inventory
productSchema.methods.deductInventory = async function(quantity) {
  if (!this.hasStock(quantity)) {
    throw new Error(`Insufficient inventory for ${this.name}`);
  }
  this.inventory -= quantity;
  return this.save();
};

// Method to add inventory
productSchema.methods.addInventory = async function(quantity) {
  this.inventory += quantity;
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);
