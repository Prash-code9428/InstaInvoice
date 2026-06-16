/**
 * Helper to format a numeric value into Indian Rupee (INR) currency format
 * using the en-IN locale (which handles lakh and crore grouping).
 * 
 * @param {number|string} value - The numeric value to format
 * @returns {string} The formatted currency string (e.g., ₹1,00,000.00)
 */
export const formatINR = (value) => {
  const number = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(number)) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(0);
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(number);
};
