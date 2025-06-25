const CreditCardPayment = require('./creditCardPayment');
const PaypalPayment = require('./paypalPayment');
const BankTransferPayment = require('./bankTransferPayment');
const PaymentProcessor = require('./paymentProcessor');

describe('Payment Strategies', () => {
  test('CreditCardPayment works', async () => {
    const strategy = new CreditCardPayment('1234567890123456');
    const result = await strategy.pay(50);
    expect(result).toMatch(/Paid \$50 with Credit Card ending in 3456/);
  });

  test('PaypalPayment works', async () => {
    const strategy = new PaypalPayment('test@paypal.com');
    const result = await strategy.pay(75);
    expect(result).toMatch(/Paid \$75 via PayPal \(test@paypal.com\)/);
  });

  test('BankTransferPayment works', async () => {
    const strategy = new BankTransferPayment('9876543210');
    const result = await strategy.pay(120);
    expect(result).toMatch(/Paid \$120 via Bank Transfer \(Account: 9876543210\)/);
  });

  test('PaymentProcessor switches strategies', async () => {
    const processor = new PaymentProcessor(new CreditCardPayment('1111222233334444'));
    expect(await processor.process(10)).toMatch(/Paid \$10 with Credit Card ending in 4444/);
    processor.setStrategy(new PaypalPayment('a@b.com'));
    expect(await processor.process(20)).toMatch(/Paid \$20 via PayPal \(a@b.com\)/);
  });

  test('Error handling', async () => {
    await expect(new CreditCardPayment().pay(10)).rejects.toThrow();
    await expect(new PaypalPayment().pay(10)).rejects.toThrow();
    await expect(new BankTransferPayment().pay(10)).rejects.toThrow();
    expect(() => new PaymentProcessor(null)).toThrow();
  });
}); 