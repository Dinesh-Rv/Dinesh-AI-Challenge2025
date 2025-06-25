/**
 * @interface DbConnection
 */
class DbConnection {
  /**
   * Connect to the database.
   * @returns {Promise<string>}
   */
  async connect() {
    throw new Error('connect() must be implemented');
  }
}
module.exports = DbConnection; 