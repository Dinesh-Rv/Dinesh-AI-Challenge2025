# Observer Pattern – Event Notification System

This module demonstrates the Observer Pattern in a Node.js context for user event notifications.

## Structure
- `observer.js`: Observer interface
- `eventSubject.js`: Subject (observable)
- `emailNotifier.js`, `smsNotifier.js`: Concrete observers
- `client.js`: Usage example
- `observer.test.js`: Jest unit tests

## Usage
Run the example:
```bash
node client.js
```

## Testing
Run the tests:
```bash
jest observer.test.js
``` 