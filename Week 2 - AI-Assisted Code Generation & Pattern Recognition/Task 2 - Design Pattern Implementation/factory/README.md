# Factory Pattern – Database Connection Factory

This module demonstrates the Factory Pattern in a Node.js context for database connections.

## Structure
- `dbConnection.js`: Interface for DB connections
- `postgresConnection.js`, `mongoConnection.js`, `redisConnection.js`: Concrete connections
- `dbConnectionFactory.js`: Factory function
- `client.js`: Usage example
- `dbFactory.test.js`: Jest unit tests

## Usage
Run the example:
```bash
node client.js
```

## Testing
Run the tests:
```bash
jest dbFactory.test.js
``` 