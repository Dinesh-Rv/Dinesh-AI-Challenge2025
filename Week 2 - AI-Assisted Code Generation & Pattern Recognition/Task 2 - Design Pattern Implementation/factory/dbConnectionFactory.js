const PostgresConnection = require('./postgresConnection');
const MongoConnection = require('./mongoConnection');
const RedisConnection = require('./redisConnection');

/**
 * Create a database connection based on type.
 * @param {'postgres'|'mongo'|'redis'} type
 * @returns {import('./dbConnection')}
 */
function dbConnectionFactory(type) {
  switch (type) {
    case 'postgres':
      return new PostgresConnection();
    case 'mongo':
      return new MongoConnection();
    case 'redis':
      return new RedisConnection();
    default:
      throw new Error('Unknown database type');
  }
}
module.exports = dbConnectionFactory; 