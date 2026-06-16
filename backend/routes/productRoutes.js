const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @route   GET /api/products
 * @desc    Fetch all product ledger items for the current user
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const products = await Product.find({ userId: req.user }).sort({ createdAt: -1 });
    return res.status(200).json(products);
  } catch (error) {
    console.error(`Error fetching products: ${error.message}`);
    return res.status(500).json({ error: 'Server error while fetching inventory list' });
  }
});

/**
 * @route   POST /api/products
 * @desc    Add a new product or service
 * @access  Private
 */
router.post('/', authMiddleware, async (req, res) => {
  const { name, productId, basePrice, hsnSacCode, gstRate } = req.body;

  try {
    const newProduct = new Product({
      userId: req.user,
      name,
      productId,
      basePrice,
      hsnSacCode,
      gstRate
    });

    const savedProduct = await newProduct.save();
    return res.status(201).json(savedProduct);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ errors: errorMessages });
    }
    // Handle uniqueness duplicate key error (code 11000)
    if (error.code === 11000) {
      return res.status(400).json({ errors: ['Product ID / Batch Number must be unique. An item with this ID already exists.'] });
    }
    console.error(`Error saving product: ${error.message}`);
    return res.status(500).json({ error: 'Server error while creating inventory item' });
  }
});

/**
 * @route   PUT /api/products/:id
 * @desc    Update an existing product or service
 * @access  Private
 */
router.put('/:id', authMiddleware, async (req, res) => {
  const { name, productId, basePrice, hsnSacCode, gstRate } = req.body;

  try {
    let product = await Product.findOne({ _id: req.params.id, userId: req.user });
    if (!product) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    product.name = name;
    product.productId = productId;
    product.basePrice = basePrice;
    product.hsnSacCode = hsnSacCode;
    product.gstRate = gstRate;

    const updatedProduct = await product.save();
    return res.status(200).json(updatedProduct);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ errors: errorMessages });
    }
    if (error.code === 11000) {
      return res.status(400).json({ errors: ['Product ID / Batch Number must be unique. An item with this ID already exists.'] });
    }
    console.error(`Error updating product: ${error.message}`);
    return res.status(500).json({ error: 'Server error while updating inventory item' });
  }
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product or service
 * @access  Private
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, userId: req.user });
    if (!product) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    await Product.findOneAndDelete({ _id: req.params.id, userId: req.user });
    return res.status(200).json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error(`Error deleting product: ${error.message}`);
    return res.status(500).json({ error: 'Server error while deleting inventory item' });
  }
});

module.exports = router;
