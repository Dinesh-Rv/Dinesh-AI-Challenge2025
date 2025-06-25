const winston = require('winston');

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
  ],
});

module.exports = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });
  res.status(500).json({ message: err.message || 'Internal Server Error' });
}; 