const PaymentStrategy = require('./paymentStrategy');

/**
 * @implements PaymentStrategy
 */
class CreditCardPayment extends PaymentStrategy {
  /**
   * @param {string} cardNumber
   */
  constructor(cardNumber) {
    super();
    this.cardNumber = cardNumber;
  }

  /**
   * @inheritdoc
   */
  async pay(amount) {
    if (!this.cardNumber) throw new Error('Card number required');
    // Simulate payment logic
    return `Paid $${amount} with Credit Card ending in ${this.cardNumber.slice(-4)}`;
  }
}
module.exports = CreditCardPayment; 