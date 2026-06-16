const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Invoice = require('../models/invoiceModel');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @route   GET /api/analytics/summary
 * @desc    Get aggregated business statistics, top items, and monthly sales trends
 * @access  Private
 */
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user);

    // 1. Fetch all invoices for this user
    const invoices = await Invoice.find({ userId });

    let totalRevenue = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalTaxable = 0;
    let invoiceCount = invoices.length;
    let paidCount = 0;
    let pendingCount = 0;
    let paidAmount = 0;
    let pendingAmount = 0;

    // Track product sales and monthly trends
    const productStats = {}; // { productName: { revenue: 0, quantity: 0 } }
    const monthlySalesStats = {}; // { "YYYY-MM": revenue }

    for (let inv of invoices) {
      const regType = inv.enterpriseProfileSnapshot?.registrationType || 'Unregistered / Small Business';
      const isRegular = regType === 'Regular Taxpayer';
      
      let invTaxableValueSum = 0;
      let invCgstSum = 0;
      let invSgstSum = 0;
      let invGrandTotal = 0;

      for (let item of inv.lineItems) {
        const price = parseFloat(item.basePrice) || 0;
        const qty = parseInt(item.quantity) || 0;
        const disc = parseFloat(item.discountPercentage) || 0;
        const gst = parseFloat(item.gstRate) || 0;

        // Math: Taxable Value = (Base Price * Qty) - Discount
        const taxable = (price * qty) - ((price * qty) * (disc / 100));
        let cgst = 0;
        let sgst = 0;

        if (isRegular) {
          cgst = taxable * ((gst / 2) / 100);
          sgst = taxable * ((gst / 2) / 100);
        }

        const total = taxable + cgst + sgst;

        invTaxableValueSum += taxable;
        invCgstSum += cgst;
        invSgstSum += sgst;
        invGrandTotal += total;

        // product statistics
        if (item.name) {
          if (!productStats[item.name]) {
            productStats[item.name] = { revenue: 0, quantity: 0 };
          }
          productStats[item.name].revenue += total;
          productStats[item.name].quantity += qty;
        }
      }

      totalRevenue += invGrandTotal;
      totalCgst += invCgstSum;
      totalSgst += invSgstSum;
      totalTaxable += invTaxableValueSum;

      if (inv.status === 'Paid') {
        paidCount++;
        paidAmount += invGrandTotal;
      } else {
        pendingCount++;
        pendingAmount += invGrandTotal;
      }

      // monthly sales trend
      if (inv.invoiceDate) {
        const dateObj = new Date(inv.invoiceDate);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const monthKey = `${year}-${month}`;
        
        if (!monthlySalesStats[monthKey]) {
          monthlySalesStats[monthKey] = 0;
        }
        monthlySalesStats[monthKey] += invGrandTotal;
      }
    }

    const stats = {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalCgst: Math.round(totalCgst * 100) / 100,
      totalSgst: Math.round(totalSgst * 100) / 100,
      totalTaxable: Math.round(totalTaxable * 100) / 100,
      invoiceCount,
      paidCount,
      pendingCount,
      paidAmount: Math.round(paidAmount * 100) / 100,
      pendingAmount: Math.round(pendingAmount * 100) / 100
    };

    // Sort and limit to top 3 products
    const topProducts = Object.keys(productStats).map(name => ({
      name,
      revenue: Math.round(productStats[name].revenue * 100) / 100,
      quantity: productStats[name].quantity
    })).sort((a, b) => b.revenue - a.revenue).slice(0, 3);

    // Sort and format monthly sales
    const monthlySales = Object.keys(monthlySalesStats).map(month => ({
      month,
      revenue: Math.round(monthlySalesStats[month] * 100) / 100
    })).sort((a, b) => a.month.localeCompare(b.month));

    return res.status(200).json({
      summary: stats,
      topProducts,
      monthlySales
    });
  } catch (error) {
    console.error(`Analytics aggregation error: ${error.message}`);
    return res.status(500).json({ error: 'Server error while compiling analytics metrics' });
  }
});

module.exports = router;
