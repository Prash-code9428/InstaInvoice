const mongoose = require('mongoose');

const invoiceLineItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Line item name is required'],
    trim: true
  },
  productId: {
    type: String,
    trim: true
  },
  basePrice: {
    type: Number,
    required: [true, 'Line item base price is required'],
    min: [0, 'Base price must be a non-negative number']
  },
  hsnSacCode: {
    type: String,
    trim: true
  },
  gstRate: {
    type: Number,
    required: [true, 'GST rate is required'],
    enum: [0, 5, 12, 18, 28]
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: [0, 'Discount percentage cannot be less than 0'],
    max: [100, 'Discount percentage cannot exceed 100']
  }
});

const enterpriseSnapshotSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  contactNumber: { type: String, required: true },
  registrationType: { type: String, required: true },
  gstin: { type: String }
});

const invoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID reference is required']
  },
  invoiceNumber: {
    type: String,
    required: [true, 'Invoice number is required'],
    trim: true
  },
  clientName: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true
  },
  clientAddress: {
    type: String,
    required: [true, 'Client address is required'],
    trim: true
  },
  invoiceDate: {
    type: Date,
    required: [true, 'Invoice date is required'],
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  lineItems: {
    type: [invoiceLineItemSchema],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'An invoice must contain at least one line item'
    }
  },
  enterpriseProfileSnapshot: {
    type: enterpriseSnapshotSchema,
    required: [true, 'Enterprise profile snapshot is required at the time of invoicing']
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending'],
    default: 'Pending',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals computed on the fly in RAM for totals to save DB storage space
invoiceSchema.virtual('taxableValueSum').get(function() {
  if (!this.lineItems) return 0;
  const sum = this.lineItems.reduce((acc, item) => {
    const price = item.basePrice || 0;
    const qty = item.quantity || 0;
    const disc = item.discountPercentage || 0;
    return acc + ((price * qty) - ((price * qty) * (disc / 100)));
  }, 0);
  return Math.round(sum * 100) / 100;
});

invoiceSchema.virtual('cgstSum').get(function() {
  if (!this.lineItems) return 0;
  const isRegular = this.enterpriseProfileSnapshot?.registrationType === 'Regular Taxpayer';
  if (!isRegular) return 0;
  const sum = this.lineItems.reduce((acc, item) => {
    const price = item.basePrice || 0;
    const qty = item.quantity || 0;
    const disc = item.discountPercentage || 0;
    const gst = item.gstRate || 0;
    const taxable = (price * qty) - ((price * qty) * (disc / 100));
    return acc + (taxable * ((gst / 2) / 100));
  }, 0);
  return Math.round(sum * 100) / 100;
});

invoiceSchema.virtual('sgstSum').get(function() {
  if (!this.lineItems) return 0;
  const isRegular = this.enterpriseProfileSnapshot?.registrationType === 'Regular Taxpayer';
  if (!isRegular) return 0;
  const sum = this.lineItems.reduce((acc, item) => {
    const price = item.basePrice || 0;
    const qty = item.quantity || 0;
    const disc = item.discountPercentage || 0;
    const gst = item.gstRate || 0;
    const taxable = (price * qty) - ((price * qty) * (disc / 100));
    return acc + (taxable * ((gst / 2) / 100));
  }, 0);
  return Math.round(sum * 100) / 100;
});

invoiceSchema.virtual('grandTotal').get(function() {
  if (!this.lineItems) return 0;
  const isRegular = this.enterpriseProfileSnapshot?.registrationType === 'Regular Taxpayer';
  const sum = this.lineItems.reduce((acc, item) => {
    const price = item.basePrice || 0;
    const qty = item.quantity || 0;
    const disc = item.discountPercentage || 0;
    const gst = item.gstRate || 0;
    const taxable = (price * qty) - ((price * qty) * (disc / 100));
    let cgst = 0;
    let sgst = 0;
    if (isRegular) {
      cgst = taxable * ((gst / 2) / 100);
      sgst = taxable * ((gst / 2) / 100);
    }
    return acc + (taxable + cgst + sgst);
  }, 0);
  return Math.round(sum * 100) / 100;
});

// Compound index to ensure uniqueness of invoiceNumber per user
invoiceSchema.index({ userId: 1, invoiceNumber: 1 }, { unique: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
