const CreditCardPayment = require('./creditCardPayment');
const PaypalPayment = require('./paypalPayment');
const BankTransferPayment = require('./bankTransferPayment');
const PaymentProcessor = require('./paymentProcessor');

(async () => {
  try {
    const processor = new PaymentProcessor(new CreditCardPayment('1234567890123456'));
    console.log(await processor.process(100));

    processor.setStrategy(new PaypalPayment('user@example.com'));
    console.log(await processor.process(200));

    processor.setStrategy(new BankTransferPayment('9876543210'));
    console.log(await processor.process(300));
  } catch (err) {
    console.error('Payment error:', err.message);
  }
})(); 