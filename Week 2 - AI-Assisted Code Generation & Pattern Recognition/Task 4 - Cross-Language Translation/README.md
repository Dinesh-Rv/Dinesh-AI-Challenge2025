# Sales Data Processor

A Node.js utility to process sales records with validation, error handling, and summary statistics.

## Features
- Input validation with Joi
- Date handling with date-fns
- Custom error handling
- Comprehensive Jest unit tests

## Installation

```bash
npm install
```

## Usage

```js
const { processSalesData } = require('./convertedCode');

const salesRecords = [
  { amount: 100, category: 'Books', date: '2024-06-01' },
  { amount: '200', category: 'Electronics', date: '2024-06-15' },
  { amount: 50, category: 'Books', date: '2024-07-01' }
];

try {
  const summary = processSalesData(salesRecords);
  console.log(summary);
} catch (err) {
  console.error(err);
}
```

## Running Tests

```bash
npm test
``` 