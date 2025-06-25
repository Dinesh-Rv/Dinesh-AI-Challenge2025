# Strategy Pattern – Payment Processing

This module demonstrates the Strategy Pattern in a Node.js context for payment processing.

## Structure
- `paymentStrategy.js`: Interface for payment strategies
- `creditCardPayment.js`, `paypalPayment.js`, `bankTransferPayment.js`: Concrete strategies
- `paymentProcessor.js`: Context class
- `client.js`: Usage example
- `paymentStrategy.test.js`: Jest unit tests

## Usage
Run the example:
```bash
node client.js
```

## Testing
Run the tests:
```bash
jest paymentStrategy.test.js
``` 