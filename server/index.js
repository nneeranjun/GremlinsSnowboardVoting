const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Routes
app.use('/api/destinations', require('./routes/destinations'));
app.use('/api/votes', require('./routes/votes'));
app.use('/api/swipe', require('./routes/swipe'));
app.use('/api/accommodations', require('./routes/accommodations'));
app.use('/api/tournament', require('./routes/tournament'));

// Serve React app for any non-API routes (only in production)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
} else {
  // In development, just send a simple message for non-API routes
  app.get('*', (req, res) => {
    res.json({ 
      message: 'API server running. Start the React client with: cd client && npm start' 
    });
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});