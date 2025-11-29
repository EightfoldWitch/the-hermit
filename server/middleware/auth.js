const { getSession, updateSessionActivity } = require('../utils/session');

/**
 * Middleware to validate session token for user APIs
 */
async function requireAuth(req, res, next) {
  try {
    const sessionKey = req.headers['x-session-token'] || req.query.session_token || req.body.session_token;

    if (!sessionKey) {
      return res.status(401).json({
        success: false,
        error: 'Session token required'
      });
    }

    const session = await getSession(sessionKey);

    if (!session) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session'
      });
    }

    // Update session activity
    await updateSessionActivity(sessionKey);

    // Attach session info to request
    req.session = session;
    req.userKey = session.users_key;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
}

/**
 * Middleware to require admin role
 */
async function requireAdmin(req, res, next) {
  try {
    // First check authentication
    const sessionKey = req.headers['x-session-token'] || req.query.session_token || req.body.session_token;

    if (!sessionKey) {
      return res.status(401).json({
        success: false,
        error: 'Session token required'
      });
    }

    const { getSession, updateSessionActivity } = require('../utils/session');
    const session = await getSession(sessionKey);

    if (!session) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session'
      });
    }

    // Update session activity
    await updateSessionActivity(sessionKey);

    // Attach session info to request
    req.session = session;
    req.userKey = session.users_key;

    // Check admin role
    const pool = require('../config/database');
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT users_role FROM Users WHERE users_key = $1',
        [req.userKey]
      );

      if (result.rows.length === 0 || result.rows[0].users_role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Admin access required'
        });
      }

      next();
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authorization error'
    });
  }
}

module.exports = {
  requireAuth,
  requireAdmin
};

