const DbConnection = require('./dbConnection');

/**
 * @implements DbConnection
 */
class RedisConnection extends DbConnection {
  async connect() {
    // Simulate connection
    return 'Connected to Redis';
  }
}
module.exports = RedisConnection; 