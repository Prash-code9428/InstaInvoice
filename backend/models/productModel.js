const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID reference is required']
  },
  name: {
    type: String,
    required: [true, 'Product or Service name is required'],
    trim: true
  },
  productId: {
    type: String,
    trim: true
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Base price must be a non-negative number']
  },
  hsnSacCode: {
    type: String,
    trim: true
  },
  gstRate: {
    type: Number,
    required: [true, 'Default GST Rate is required'],
    enum: {
      values: [0, 5, 12, 18, 28],
      message: '{VALUE}% is not a valid GST rate enum (0, 5, 12, 18, 28)'
    },
    default: 18
  }
}, {
  timestamps: true
});

// Compound index to ensure uniqueness of productId per user when provided
productSchema.index(
  { userId: 1, productId: 1 },
  { 
    unique: true,
    partialFilterExpression: { productId: { $gt: '' } }
  }
);

module.exports = mongoose.model('Product', productSchema);
