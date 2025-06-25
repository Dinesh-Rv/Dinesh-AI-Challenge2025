const DbConnection = require('./dbConnection');

/**
 * @implements DbConnection
 */
class MongoConnection extends DbConnection {
  async connect() {
    // Simulate connection
    return 'Connected to MongoDB';
  }
}
module.exports = MongoConnection; 