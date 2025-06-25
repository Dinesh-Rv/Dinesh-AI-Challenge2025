const express = require('express');
const cartRouter = require('./cart');

const app = express();
app.use(express.json());
app.use('/cart', cartRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app; 