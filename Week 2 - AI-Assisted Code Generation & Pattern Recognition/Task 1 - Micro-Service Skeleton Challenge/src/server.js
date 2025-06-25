const express = require('express');
const dotenv = require('dotenv');
const winston = require('winston');
const userRoutes = require('./routes/userRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Winston logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
  ],
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('User Management Microservice is running.');
});

// User routes
app.use('/api/users', userRoutes);

// Error handling middleware
app.use(errorMiddleware);

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
}); 