const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const aiTravelRouter = require('./plugins/aiTravel/routes/index.js');

// Routes
app.use('/api/v1/ai-travel', aiTravelRouter);

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Start server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
