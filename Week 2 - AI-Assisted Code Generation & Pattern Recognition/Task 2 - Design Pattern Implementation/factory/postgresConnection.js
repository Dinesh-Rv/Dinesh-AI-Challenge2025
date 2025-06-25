const DbConnection = require('./dbConnection');

/**
 * @implements DbConnection
 */
class PostgresConnection extends DbConnection {
  async connect() {
    // Simulate connection
    return 'Connected to PostgreSQL';
  }
}
module.exports = PostgresConnection; 