const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/database');
const { startSessionCacheRefresh } = require('./utils/session');

// Import routes
const statusRoutes = require('./routes/status');
const userRoutes = require('./routes/users');
const readingRoutes = require('./routes/reading');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/status', statusRoutes);
app.use('/users', userRoutes);
app.use('/reading', readingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Test database connection
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('Database connection established');
  } catch (error) {
    console.error('Database connection failed:', error);
  }

  // Start session cache refresh
  startSessionCacheRefresh();
  console.log('Session cache refresh started');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

module.exports = app;

