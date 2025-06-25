/**
 * @interface PaymentStrategy
 * @description Interface for payment strategies.
 */
class PaymentStrategy {
  /**
   * Process a payment.
   * @param {number} amount
   * @returns {Promise<string>}
   */
  async pay(amount) {
    throw new Error('pay() must be implemented');
  }
}
module.exports = PaymentStrategy; 