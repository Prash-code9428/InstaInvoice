/**
 * Calculates invoice financial totals dynamically on-the-fly in RAM.
 * Supports Regular Taxpayer splits (CGST/SGST) and unregistered/composition scheme layouts.
 * 
 * @param {object} inv - The raw invoice object loaded from the database or state.
 * @returns {object} Calculated totals and processed line items.
 */
export const getInvoiceTotals = (inv) => {
  if (!inv || !inv.lineItems) {
    return { taxableSum: 0, cgstSum: 0, sgstSum: 0, grandTotal: 0, lines: [] };
  }

  const regType = inv.enterpriseProfileSnapshot?.registrationType || 'Unregistered / Small Business';
  const isRegular = regType === 'Regular Taxpayer';

  let taxableSum = 0;
  let cgstSum = 0;
  let sgstSum = 0;
  let grandTotal = 0;

  const lines = inv.lineItems.map(item => {
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

    taxableSum += taxable;
    cgstSum += cgst;
    sgstSum += sgst;
    grandTotal += total;

    return {
      ...item,
      taxableValue: Math.round(taxable * 100) / 100,
      cgst: Math.round(cgst * 100) / 100,
      sgst: Math.round(sgst * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  });

  return {
    taxableSum: Math.round(taxableSum * 100) / 100,
    cgstSum: Math.round(cgstSum * 100) / 100,
    sgstSum: Math.round(sgstSum * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100,
    lines
  };
};
