const express = require('express');
const router = express.Router();
const pool = require('../config/database');

/**
 * GET /status
 * Open API - No authentication required
 */
router.get('/', async (req, res) => {
  try {
    // Test database connection
    let dbStatus = 'disconnected';
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'error';
    }

    res.json({
      success: true,
      status: {
        server: 'running',
        database: dbStatus,
        version: '1.0.0',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get status'
    });
  }
});

module.exports = router;

