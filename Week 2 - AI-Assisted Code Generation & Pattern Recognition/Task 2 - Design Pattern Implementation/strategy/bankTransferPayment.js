const PaymentStrategy = require('./paymentStrategy');

/**
 * @implements PaymentStrategy
 */
class BankTransferPayment extends PaymentStrategy {
  /**
   * @param {string} accountNumber
   */
  constructor(accountNumber) {
    super();
    this.accountNumber = accountNumber;
  }

  /**
   * @inheritdoc
   */
  async pay(amount) {
    if (!this.accountNumber) throw new Error('Account number required');
    // Simulate payment logic
    return `Paid $${amount} via Bank Transfer (Account: ${this.accountNumber})`;
  }
}
module.exports = BankTransferPayment; 