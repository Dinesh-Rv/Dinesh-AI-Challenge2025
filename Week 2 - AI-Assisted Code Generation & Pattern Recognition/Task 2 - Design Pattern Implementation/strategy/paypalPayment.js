const PaymentStrategy = require('./paymentStrategy');

/**
 * @implements PaymentStrategy
 */
class PaypalPayment extends PaymentStrategy {
  /**
   * @param {string} email
   */
  constructor(email) {
    super();
    this.email = email;
  }

  /**
   * @inheritdoc
   */
  async pay(amount) {
    if (!this.email) throw new Error('PayPal email required');
    // Simulate payment logic
    return `Paid $${amount} via PayPal (${this.email})`;
  }
}
module.exports = PaypalPayment; 