const mongoose = require('mongoose');
const { CUSTOMIZATION_TYPES } = require('../config/constants');

const customizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customization name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  type: {
    type: String,
    enum: Object.values(CUSTOMIZATION_TYPES),
    required: [true, 'Customization type is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    default: 0
  },
  isVegetarian: {
    type: Boolean,
    default: true
  },
  isAvailable: {
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

// Index for efficient querying
customizationSchema.index({ type: 1, isAvailable: 1 });

module.exports = mongoose.model('Customization', customizationSchema);
