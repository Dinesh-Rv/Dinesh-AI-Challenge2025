const dbConnectionFactory = require('./dbConnectionFactory');

(async () => {
  try {
    const pg = dbConnectionFactory('postgres');
    console.log(await pg.connect());

    const mongo = dbConnectionFactory('mongo');
    console.log(await mongo.connect());

    const redis = dbConnectionFactory('redis');
    console.log(await redis.connect());
  } catch (err) {
    console.error('DB error:', err.message);
  }
})(); 