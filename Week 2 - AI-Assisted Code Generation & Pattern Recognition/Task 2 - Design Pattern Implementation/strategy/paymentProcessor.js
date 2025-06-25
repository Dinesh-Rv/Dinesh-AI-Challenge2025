class PaymentProcessor {
  /**
   * @param {import('./paymentStrategy')} strategy
   */
  constructor(strategy) {
    this.setStrategy(strategy);
  }

  /**
   * @param {import('./paymentStrategy')} strategy
   */
  setStrategy(strategy) {
    if (!strategy || typeof strategy.pay !== 'function') {
      throw new Error('Invalid payment strategy');
    }
    this.strategy = strategy;
  }

  /**
   * @param {number} amount
   * @returns {Promise<string>}
   */
  async process(amount) {
    return this.strategy.pay(amount);
  }
}
module.exports = PaymentProcessor; 