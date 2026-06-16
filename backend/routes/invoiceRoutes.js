const express = require('express');
const router = express.Router();
const Invoice = require('../models/invoiceModel');
const EnterpriseProfile = require('../models/profileModel');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @route   GET /api/invoices
 * @desc    Fetch invoice history for the current user
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user }).sort({ createdAt: -1 });
    return res.status(200).json(invoices);
  } catch (error) {
    console.error(`Error fetching invoices: ${error.message}`);
    return res.status(500).json({ error: 'Server error while fetching invoice records' });
  }
});

/**
 * @route   POST /api/invoices
 * @desc    Generate a new client invoice (saves calculations and active company snapshot)
 * @access  Private
 */
router.post('/', authMiddleware, async (req, res) => {
  const { invoiceNumber, clientName, clientAddress, invoiceDate, dueDate, lineItems } = req.body;

  try {
    // 1. Fetch current business profile configuration to snapshot and check tax rules
    const activeProfile = await EnterpriseProfile.findOne({ userId: req.user });
    if (!activeProfile) {
      return res.status(400).json({ errors: ['Active Enterprise Profile is not configured. Please set up profile settings first.'] });
    }

    const regType = activeProfile.registrationType;
    const isRegularTaxpayer = regType === 'Regular Taxpayer';

    // 2. Map raw item attributes (omitting totals and intermediate calculations)
    let computedLineItems = [];

    if (!lineItems || lineItems.length === 0) {
      return res.status(400).json({ errors: ['An invoice must contain at least one line item'] });
    }

    for (let item of lineItems) {
      const basePrice = parseFloat(item.basePrice);
      const quantity = parseInt(item.quantity);
      const discountPct = parseFloat(item.discountPercentage || 0);
      const gstRate = parseFloat(item.gstRate);

      computedLineItems.push({
        name: item.name,
        productId: item.productId || undefined,
        basePrice,
        hsnSacCode: item.hsnSacCode || undefined,
        gstRate,
        quantity,
        discountPercentage: discountPct
      });
    }

    // 3. Build invoice entity (no taxableValueSum, cgstSum, sgstSum, or grandTotal stored)
    const newInvoice = new Invoice({
      userId: req.user,
      invoiceNumber: invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
      clientName,
      clientAddress,
      invoiceDate: invoiceDate || new Date(),
      dueDate,
      lineItems: computedLineItems,
      enterpriseProfileSnapshot: {
        name: activeProfile.name,
        address: activeProfile.address,
        contactNumber: activeProfile.contactNumber,
        registrationType: activeProfile.registrationType,
        gstin: activeProfile.gstin
      }
    });

    const savedInvoice = await newInvoice.save();
    return res.status(201).json(savedInvoice);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ errors: errorMessages });
    }
    // Duplicate Key
    if (error.code === 11000) {
      return res.status(400).json({ errors: ['Invoice Number already exists. It must be unique.'] });
    }
    console.error(`Error saving invoice: ${error.message}`);
    return res.status(500).json({ error: 'Server error while creating invoice configuration' });
  }
});

/**
 * @route   PUT /api/invoices/:id/status
 * @desc    Toggle invoice payment status
 * @access  Private
 */
router.put('/:id/status', authMiddleware, async (req, res) => {
  const { status } = req.body;

  if (!status || !['Paid', 'Pending'].includes(status)) {
    return res.status(400).json({ error: 'Valid status ("Paid" or "Pending") is required' });
  }

  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, userId: req.user },
      { status },
      { new: true, runValidators: true }
    );

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found or unauthorized' });
    }

    return res.status(200).json(invoice);
  } catch (error) {
    console.error(`Error updating invoice status: ${error.message}`);
    return res.status(500).json({ error: 'Server error while updating status' });
  }
});

module.exports = router;
