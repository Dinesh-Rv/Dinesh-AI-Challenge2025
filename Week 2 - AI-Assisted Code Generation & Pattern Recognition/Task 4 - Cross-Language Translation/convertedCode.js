// @ts-check

/**
 * @typedef {Object} SalesRecord
 * @property {number|string} amount - The sale amount
 * @property {string} category - The sale category
 * @property {Date|string} date - The sale date (Date object or ISO string)
 */

/**
 * @typedef {Object} SalesSummary
 * @property {number} totalSales
 * @property {number} averageSale
 * @property {Object.<string, number>} salesByCategory
 * @property {Object.<string, number>} monthlySales
 * @property {number} recordCount
 */

const Joi = require('joi');
const { parseISO, isValid, format } = require('date-fns');

/**
 * Custom error for invalid sales data
 */
class SalesDataError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SalesDataError';
  }
}

// Joi schema for input validation
const salesRecordSchema = Joi.object({
  amount: Joi.alternatives().try(Joi.number(), Joi.string().pattern(/^\d+(\.\d+)?$/)).required(),
  category: Joi.string().min(1).required(),
  date: Joi.alternatives().try(
    Joi.date(),
    Joi.string().isoDate()
  ).required()
});

/**
 * Process sales records and return summary statistics
 * @param {SalesRecord[]} salesRecords
 * @returns {SalesSummary}
 * @throws {SalesDataError}
 */
function processSalesData(salesRecords) {
  if (!Array.isArray(salesRecords) || salesRecords.length === 0) {
    throw new SalesDataError('No sales records provided');
  }

  let totalSales = 0;
  /** @type {Record<string, number>} */
  const salesByCategory = {};
  /** @type {Record<string, number>} */
  const monthlySales = {};

  for (const record of salesRecords) {
    const { error, value } = salesRecordSchema.validate(record);
    if (error) {
      throw new SalesDataError(`Invalid record format: ${JSON.stringify(record)} - ${error.message}`);
    }

    // Parse amount
    const amount = typeof value.amount === 'string' ? parseFloat(value.amount) : value.amount;
    if (isNaN(amount) || amount < 0) {
      throw new SalesDataError(`Invalid amount in record: ${JSON.stringify(record)}`);
    }

    const category = value.category;

    // Parse date
    let dateObj;
    if (value.date instanceof Date) {
      dateObj = value.date;
    } else {
      dateObj = parseISO(value.date);
    }
    if (!isValid(dateObj)) {
      throw new SalesDataError(`Invalid date in record: ${JSON.stringify(record)}`);
    }

    totalSales += amount;

    // Sales by category
    salesByCategory[category] = (salesByCategory[category] || 0) + amount;

    // Monthly sales
    const monthKey = format(dateObj, 'yyyy-MM');
    monthlySales[monthKey] = (monthlySales[monthKey] || 0) + amount;
  }

  return {
    totalSales,
    averageSale: totalSales / salesRecords.length,
    salesByCategory,
    monthlySales,
    recordCount: salesRecords.length
  };
}

module.exports = {
  processSalesData,
  SalesDataError
}; 