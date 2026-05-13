require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimitMiddleware = require('./middleware/rateLimit');
const birdeyeRoutes = require('./routes/birdeye');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(rateLimitMiddleware);

app.use('/api', birdeyeRoutes);

app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚨 RugRadar backend running on port ${PORT}`);
});
