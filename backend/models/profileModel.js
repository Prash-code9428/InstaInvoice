const mongoose = require('mongoose');

// Regular expression for valid Indian GSTIN structure: 
// 2 digits, 5 letters, 4 digits, 1 letter, 1 digit/letter, 'Z', 1 digit/letter
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;

const enterpriseProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID reference is required'],
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Enterprise name is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true
  },
  registrationType: {
    type: String,
    required: [true, 'Registration type is required'],
    enum: {
      values: ['Regular Taxpayer', 'Composition Scheme', 'Unregistered / Small Business'],
      message: '{VALUE} is not a valid tax registration type'
    }
  },
  gstin: {
    type: String,
    trim: true,
    required: [
      function() {
        return this.registrationType === 'Regular Taxpayer' || this.registrationType === 'Composition Scheme';
      },
      'GSTIN is required for Regular Taxpayer and Composition Scheme registration'
    ],
    validate: {
      validator: function(v) {
        if (this.registrationType === 'Regular Taxpayer' || this.registrationType === 'Composition Scheme') {
          return v && GSTIN_REGEX.test(v);
        }
        return true;
      },
      message: 'A valid 15-character GSTIN is required for Regular Taxpayer and Composition Scheme registration'
    }
  },
  logoUrl: {
    type: String,
    trim: true
  },
  bank: {
    bn: {
      type: String,
      trim: true,
      alias: 'bankName'
    },
    bb: {
      type: String,
      trim: true,
      alias: 'branchName'
    },
    ba: {
      type: String,
      trim: true,
      alias: 'accountNumber'
    },
    bi: {
      type: String,
      trim: true,
      alias: 'ifscCode'
    }
  },
  signatureUrl: {
    type: String,
    trim: true
  },
  upiId: {
    type: String,
    trim: true
  },
  ppm: {
    type: String,
    enum: ['BANK', 'UPI'],
    default: 'BANK',
    alias: 'preferredPaymentMethod'
  }
}, {
  timestamps: true
});

// Pre-save hook: Ensure GSTIN is cleared if the business is unregistered
enterpriseProfileSchema.pre('save', function() {
  if (this.registrationType === 'Unregistered / Small Business') {
    this.gstin = undefined;
  }
});

module.exports = mongoose.model('EnterpriseProfile', enterpriseProfileSchema);
