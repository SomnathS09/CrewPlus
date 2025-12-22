const mongoose = require('mongoose');

const customizationItemSchema = new mongoose.Schema({
  customization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customization',
    required: true
  },
  name: String,
  price: Number
});

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
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
  customizations: [customizationItemSchema],
  customizationTotal: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [200, 'Notes cannot exceed 200 characters']
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: {
    type: String,
    required: function() {
      return !this.user;
    }
  },
  items: [cartItemSchema],
  subtotal: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient querying
cartSchema.index({ user: 1 });
cartSchema.index({ sessionId: 1 });

// Calculate totals before saving
cartSchema.pre('save', function(next) {
  this.subtotal = this.items.reduce((sum, item) => {
    const itemTotal = (item.price + (item.customizationTotal || 0)) * item.quantity;
    return sum + itemTotal;
  }, 0);

  // Calculate tax (assuming 10%)
  this.tax = Math.round(this.subtotal * 0.10 * 100) / 100;
  this.total = Math.round((this.subtotal + this.tax) * 100) / 100;

  next();
});

// Method to add item to cart
cartSchema.methods.addItem = async function(productId, quantity, size, price, notes, customizations = [], customizationTotal = 0) {
  // Generate a customization key to compare items with same product but different customizations
  const customizationKey = customizations.map(c => c.customization.toString()).sort().join(',');

  const existingItem = this.items.find(item => {
    const itemCustomizationKey = (item.customizations || []).map(c => c.customization.toString()).sort().join(',');
    return item.product.toString() === productId.toString() &&
           item.size === size &&
           itemCustomizationKey === customizationKey;
  });

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({
      product: productId,
      quantity,
      size,
      price,
      notes,
      customizations,
      customizationTotal
    });
  }

  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = async function(itemId, quantity) {
  const item = this.items.id(itemId);
  if (!item) {
    throw new Error('Item not found in cart');
  }

  if (quantity <= 0) {
    this.items.pull(itemId);
  } else {
    item.quantity = quantity;
  }

  return this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = async function(itemId) {
  this.items.pull(itemId);
  return this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = async function() {
  this.items = [];
  return this.save();
};

module.exports = mongoose.model('Cart', cartSchema);
