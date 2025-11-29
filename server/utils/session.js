const pool = require('../config/database');
const crypto = require('crypto');
require('dotenv').config();

// In-memory session cache
const sessionCache = new Map();

// Session configuration
const MAX_SESSION_DURATION = parseInt(process.env.MAX_SESSION_DURATION) || 86400000; // 24 hours
const MIN_SESSION_ACTIVITY_DURATION = parseInt(process.env.MIN_SESSION_ACTIVITY_DURATION) || 1800000; // 30 minutes
const SESSION_CACHE_REFRESH_INTERVAL = parseInt(process.env.SESSION_CACHE_REFRESH_INTERVAL) || 300000; // 5 minutes

/**
 * Generates a unique session key
 */
function generateSessionKey() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Creates a new session for a user
 */
async function createSession(userKey, sessionLocation) {
  const sessionKey = generateSessionKey();
  const now = new Date();

  // Remove existing sessions for same user+location
  await removeSessionsByUserAndLocation(userKey, sessionLocation);

  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO UsersSessions (session_key, users_key, session_time_start, session_last_activity, session_location)
       VALUES ($1, $2, $3, $4, $5)`,
      [sessionKey, userKey, now, now, sessionLocation]
    );
  } finally {
    client.release();
  }

  // Add to cache
  sessionCache.set(sessionKey, {
    users_key: userKey,
    session_time_start: now,
    session_last_activity: now,
    session_location: sessionLocation
  });

  return sessionKey;
}

/**
 * Gets session from cache or database
 */
async function getSession(sessionKey) {
  // Check cache first
  if (sessionCache.has(sessionKey)) {
    const session = sessionCache.get(sessionKey);
    // Validate session is still valid
    if (isSessionValid(session)) {
      return session;
    } else {
      // Remove invalid session from cache
      sessionCache.delete(sessionKey);
    }
  }

  // Fetch from database
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT session_key, users_key, session_time_start, session_last_activity, session_location
       FROM UsersSessions
       WHERE session_key = $1`,
      [sessionKey]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const session = result.rows[0];
    
    // Validate session
    if (!isSessionValid(session)) {
      // Delete expired session
      await deleteSession(sessionKey);
      return null;
    }

    // Add to cache
    sessionCache.set(sessionKey, session);
    return session;
  } finally {
    client.release();
  }
}

/**
 * Validates if a session is still valid
 */
function isSessionValid(session) {
  if (!session) return false;

  const now = new Date();
  const sessionStart = new Date(session.session_time_start);
  const lastActivity = new Date(session.session_last_activity);

  const timeSinceStart = now - sessionStart;
  const timeSinceActivity = now - lastActivity;

  return timeSinceStart < MAX_SESSION_DURATION && 
         timeSinceActivity < MIN_SESSION_ACTIVITY_DURATION;
}

/**
 * Updates session last activity
 */
async function updateSessionActivity(sessionKey) {
  const now = new Date();

  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE UsersSessions
       SET session_last_activity = $1
       WHERE session_key = $2`,
      [now, sessionKey]
    );
  } finally {
    client.release();
  }

  // Update cache
  if (sessionCache.has(sessionKey)) {
    const session = sessionCache.get(sessionKey);
    session.session_last_activity = now;
    sessionCache.set(sessionKey, session);
  }
}

/**
 * Deletes a session
 */
async function deleteSession(sessionKey) {
  const client = await pool.connect();
  try {
    await client.query(
      `DELETE FROM UsersSessions WHERE session_key = $1`,
      [sessionKey]
    );
  } finally {
    client.release();
  }

  // Remove from cache
  sessionCache.delete(sessionKey);
}

/**
 * Removes sessions for a user with the same location
 */
async function removeSessionsByUserAndLocation(userKey, sessionLocation) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT session_key FROM UsersSessions
       WHERE users_key = $1 AND session_location = $2`,
      [userKey, sessionLocation]
    );

    for (const row of result.rows) {
      sessionCache.delete(row.session_key);
    }

    await client.query(
      `DELETE FROM UsersSessions
       WHERE users_key = $1 AND session_location = $2`,
      [userKey, sessionLocation]
    );
  } finally {
    client.release();
  }
}

/**
 * Refreshes the session cache from database
 */
async function refreshSessionCache() {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT session_key, users_key, session_time_start, session_last_activity, session_location
       FROM UsersSessions`
    );

    const now = new Date();
    const validSessions = new Map();

    for (const session of result.rows) {
      if (isSessionValid(session)) {
        validSessions.set(session.session_key, session);
      } else {
        // Delete expired sessions
        await deleteSession(session.session_key);
      }
    }

    // Update cache
    sessionCache.clear();
    for (const [key, value] of validSessions) {
      sessionCache.set(key, value);
    }

    console.log(`Session cache refreshed. Active sessions: ${validSessions.size}`);
  } finally {
    client.release();
  }
}

/**
 * Starts the session cache refresh interval
 */
function startSessionCacheRefresh() {
  // Initial refresh
  refreshSessionCache().catch(console.error);

  // Set up interval
  setInterval(() => {
    refreshSessionCache().catch(console.error);
  }, SESSION_CACHE_REFRESH_INTERVAL);
}

/**
 * Gets session location from request
 */
function getSessionLocation(req) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const clientId = req.headers['user-agent'] || 'unknown';
  return `${ip}:${clientId}`;
}

module.exports = {
  createSession,
  getSession,
  updateSessionActivity,
  deleteSession,
  isSessionValid,
  startSessionCacheRefresh,
  getSessionLocation
};

