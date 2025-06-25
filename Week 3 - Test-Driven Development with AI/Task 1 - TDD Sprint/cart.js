/**
 * @fileoverview Express router for shopping cart operations with in-memory storage, input validation, async/await, error handling, and Winston logging.
 */
const express = require('express');
const winston = require('winston');

/**
 * Winston logger configuration
 */
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

/**
 * @typedef {Object} CartItem
 * @property {string} id - Unique identifier for the item
 * @property {number} price - Price per unit
 * @property {number} quantity - Quantity of the item
 */

/**
 * Service class for cart operations (SRP, OCP, SOLID)
 */
class CartService {
  /**
   * @param {CartItem[]} [cart=[]] Initial cart state
   */
  constructor(cart = []) {
    /** @private */
    this._cart = cart;
  }

  /**
   * Validate a cart item
   * @param {Partial<CartItem>} item
   * @returns {boolean}
   */
  static validateItem(item) {
    if (!item || typeof item.id !== 'string' || !item.id.trim()) return false;
    if (typeof item.price !== 'number' || item.price < 0) return false;
    if (typeof item.quantity !== 'number' || item.quantity <= 0) return false;
    return true;
  }

  /**
   * Add an item to the cart
   * @param {CartItem} item
   */
  addItem(item) {
    const existing = this._cart.find(i => i.id === item.id);
    if (existing) {
      existing.quantity += item.quantity;
      logger.info(`Updated quantity for item '${item.id}' to ${existing.quantity}`);
    } else {
      this._cart.push({ ...item });
      logger.info(`Added item '${item.id}' to cart`);
    }
  }

  /**
   * Remove an item from the cart
   * @param {string} id
   * @returns {boolean} True if removed, false if not found
   */
  removeItem(id) {
    const idx = this._cart.findIndex(i => i.id === id);
    if (idx === -1) {
      logger.warn(`Attempted to remove non-existent item '${id}'`);
      return false;
    }
    this._cart.splice(idx, 1);
    logger.info(`Removed item '${id}' from cart`);
    return true;
  }

  /**
   * Update item quantity
   * @param {string} id
   * @param {number} quantity
   * @returns {boolean} True if updated, false if not found/invalid
   */
  updateItem(id, quantity) {
    if (typeof quantity !== 'number' || quantity <= 0) return false;
    const item = this._cart.find(i => i.id === id);
    if (!item) {
      logger.warn(`Attempted to update non-existent item '${id}'`);
      return false;
    }
    item.quantity = quantity;
    logger.info(`Updated quantity for item '${id}' to ${quantity}`);
    return true;
  }

  /**
   * Get cart contents
   * @returns {CartItem[]}
   */
  getItems() {
    return this._cart;
  }

  /**
   * Calculate total price with tax
   * @param {number} taxRate
   * @returns {number}
   */
  getTotalWithTax(taxRate) {
    const subtotal = this._cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return subtotal * (1 + taxRate);
  }
}

// Singleton cart for demonstration (not per-session)
const cartService = new CartService();

const router = express.Router();

/**
 * Add item to cart
 */
router.post('/add', async (req, res, next) => {
  try {
    const { id, price, quantity } = req.body;
    if (!CartService.validateItem({ id, price, quantity })) {
      logger.error('Invalid item data received for add');
      return res.status(400).json({ error: 'Invalid item' });
    }
    cartService.addItem({ id, price, quantity });
    res.status(200).json({ success: true });
  } catch (err) {
    logger.error(`Error in /cart/add: ${err.message}`);
    next(err);
  }
});

/**
 * Remove item from cart
 */
router.post('/remove', async (req, res, next) => {
  try {
    const { id } = req.body;
    const removed = cartService.removeItem(id);
    res.status(200).json({ success: removed });
  } catch (err) {
    logger.error(`Error in /cart/remove: ${err.message}`);
    next(err);
  }
});

/**
 * Update item quantity
 */
router.post('/update', async (req, res, next) => {
  try {
    const { id, quantity } = req.body;
    if (typeof quantity !== 'number' || quantity <= 0) {
      logger.error('Invalid quantity received for update');
      return res.status(400).json({ error: 'Invalid quantity' });
    }
    const updated = cartService.updateItem(id, quantity);
    res.status(200).json({ success: updated });
  } catch (err) {
    logger.error(`Error in /cart/update: ${err.message}`);
    next(err);
  }
});

/**
 * Get cart contents and total
 */
router.get('/', async (req, res, next) => {
  try {
    const taxRate = 0.1;
    const cart = cartService.getItems();
    const total = cartService.getTotalWithTax(taxRate);
    res.status(200).json({ cart, total });
  } catch (err) {
    logger.error(`Error in /cart: ${err.message}`);
    next(err);
  }
});

module.exports = router; 