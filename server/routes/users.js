const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { comparePassword, validatePasswordStrength } = require('../utils/password');
const { createSession, deleteSession, getSessionLocation } = require('../utils/session');
const { requireAuth, requireAdmin } = require('../middleware/auth');

/**
 * POST /users/login
 * Open API - No authentication required
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password required'
      });
    }

    // Find user by users_id
    const client = await pool.connect();
    let user;
    try {
      const result = await client.query(
        `SELECT users_key, users_id, users_email, users_name, users_role, users_state, users_password
         FROM Users
         WHERE users_id = $1`,
        [username]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      user = result.rows[0];
    } finally {
      client.release();
    }

    // Check user state
    if (user.users_state !== 'Active') {
      return res.status(403).json({
        success: false,
        error: 'User account is not active'
      });
    }

    // Verify password
    const passwordMatch = await comparePassword(password, user.users_password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Create session
    const sessionLocation = getSessionLocation(req);
    const sessionKey = await createSession(user.users_key, sessionLocation);

    // Return session key (exclude password)
    res.json({
      success: true,
      session_key: sessionKey,
      user: {
        users_key: user.users_key,
        users_id: user.users_id,
        users_email: user.users_email,
        users_name: user.users_name,
        users_role: user.users_role,
        users_state: user.users_state
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

/**
 * POST /users/logout
 * User API - Requires authentication
 */
router.post('/logout', requireAuth, async (req, res) => {
  try {
    const sessionKey = req.headers['x-session-token'] || req.query.session_token || req.body.session_token;
    
    await deleteSession(sessionKey);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

/**
 * GET /users/info
 * User API - Requires authentication
 */
router.get('/info', requireAuth, async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT users_key, users_id, users_email, users_name, users_role, users_state
         FROM Users
         WHERE users_key = $1`,
        [req.userKey]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        user: result.rows[0]
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user information'
    });
  }
});

/**
 * GET /users/settings
 * POST /users/settings
 * User API - Requires authentication
 */
router.get('/settings', requireAuth, async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT tiles_config FROM UserTiles WHERE users_key = $1 ORDER BY tiles_key DESC LIMIT 1`,
        [req.userKey]
      );

      res.json({
        success: true,
        settings: {
          tiles_config: result.rows.length > 0 ? result.rows[0].tiles_config : null
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve settings'
    });
  }
});

router.post('/settings', requireAuth, async (req, res) => {
  try {
    const { tiles_config } = req.body;

    const client = await pool.connect();
    try {
      // Update or insert tiles config (users_key is unique)
      const result = await client.query(
        `INSERT INTO UserTiles (users_key, tiles_config)
         VALUES ($1, $2)
         ON CONFLICT (users_key) 
         DO UPDATE SET tiles_config = EXCLUDED.tiles_config
         RETURNING tiles_config`,
        [req.userKey, tiles_config ? JSON.stringify(tiles_config) : null]
      );

      res.json({
        success: true,
        message: 'Settings updated successfully',
        settings: {
          tiles_config: tiles_config
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update settings'
    });
  }
});

/**
 * GET /users/list
 * Admin API - Requires admin role
 */
router.get('/list', requireAdmin, async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT users_key, users_id, users_email, users_name, users_role, users_state
         FROM Users
         ORDER BY users_key
         LIMIT $1 OFFSET $2`,
        [parseInt(limit), parseInt(offset)]
      );

      const countResult = await client.query('SELECT COUNT(*) as total FROM Users');

      res.json({
        success: true,
        users: result.rows,
        total: parseInt(countResult.rows[0].total),
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve users'
    });
  }
});

module.exports = router;

