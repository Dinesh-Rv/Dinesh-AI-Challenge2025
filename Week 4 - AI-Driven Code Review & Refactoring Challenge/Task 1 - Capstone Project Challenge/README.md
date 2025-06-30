# Gilded Rose Inventory System (JavaScript, Jest)

This project implements the Gilded Rose inventory management kata in JavaScript, with a focus on clean code, extensibility, and testability. The system updates the quality and sell-in values of various items according to specific business rules.

## Features

- Modular, extensible item update logic using the Strategy/Extract Method pattern
- Input validation and error handling for robust usage
- Comprehensive JSDoc documentation
- Performance and security audits included

## Getting Started

### Install dependencies

```sh
npm install
```

### Run the unit tests

```sh
npm test
```

### Run tests in watch mode

```sh
npm run test:watch
```

### Generate test coverage report

```sh
npm run test:coverage
```

### Run the TextTest fixture

For example, to simulate 10 days:

```sh
node test/texttest_fixture.js 10
```

## Usage Example

```js
const { Shop, Item, ITEM_AGED_BRIE, ITEM_SULFURAS } = require('./src/gilded_rose');
const items = [
  new Item(ITEM_AGED_BRIE, 2, 0),
  new Item(ITEM_SULFURAS, 0, 80)
];
const shop = new Shop(items);
shop.updateQuality();
```

## Jest Test Coverage Goals

- **Target:** 95%+ statement, branch, and function coverage
- **Required:** All item types and edge cases (e.g., max/min quality, expired items, legendary items)
- **Recommended:** Negative tests for input validation and error handling

## Project Structure

- `src/gilded_rose.js` — Main implementation
- `test/gilded_rose.test.js` — Jest unit tests
- `test/texttest_fixture.js` — Text-based scenario runner
- `gilded_rose_performance_audit.md` — Performance audit report
- `gilded_rose_old_analysis.md` — Pre-refactor code analysis

## Performance & Security

- O(n) update logic, optimal for typical use cases
- Input validation in constructors
- No hardcoded secrets or external I/O

---

For more details, see the audit and analysis markdown files in the project root.

## Run the TextTest approval test that comes with this project

There are instructions in the [TextTest Readme](../texttests/README.md) for setting up TextTest. You will need to specify the Javascript-Jest executable and interpreter in [config.gr](../texttests/config.gr). Uncomment these lines:

    executable:${TEXTTEST_HOME}/js-jest/test/texttest_fixture.js
    interpreter:node
