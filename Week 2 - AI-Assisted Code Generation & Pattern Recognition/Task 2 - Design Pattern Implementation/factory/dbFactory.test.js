const dbConnectionFactory = require('./dbConnectionFactory');

describe('Database Connection Factory', () => {
  test('Creates PostgreSQL connection', async () => {
    const conn = dbConnectionFactory('postgres');
    expect(await conn.connect()).toBe('Connected to PostgreSQL');
  });

  test('Creates MongoDB connection', async () => {
    const conn = dbConnectionFactory('mongo');
    expect(await conn.connect()).toBe('Connected to MongoDB');
  });

  test('Creates Redis connection', async () => {
    const conn = dbConnectionFactory('redis');
    expect(await conn.connect()).toBe('Connected to Redis');
  });

  test('Throws on unknown type', () => {
    expect(() => dbConnectionFactory('unknown')).toThrow('Unknown database type');
  });
}); 