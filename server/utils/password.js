const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Gets or creates the salt key file
 */
function getSaltKey() {
  const saltKeyPath = process.env.SALT_KEY_FILE || 'private/salt.key';
  const fullPath = path.resolve(saltKeyPath);
  
  if (!fs.existsSync(fullPath)) {
    // Create directory if it doesn't exist
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    // Generate a new salt key
    const crypto = require('crypto');
    const saltKey = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(fullPath, saltKey, { mode: 0o600 }); // Read/write for owner only
    return saltKey;
  }
  
  return fs.readFileSync(fullPath, 'utf8').trim();
}

/**
 * Hashes a password with the salt key
 */
async function hashPassword(password) {
  const saltKey = getSaltKey();
  const combined = password + saltKey;
  return await bcrypt.hash(combined, 10);
}

/**
 * Compares a password with a hashed password
 */
async function comparePassword(password, hashedPassword) {
  const saltKey = getSaltKey();
  const combined = password + saltKey;
  return await bcrypt.compare(combined, hashedPassword);
}

/**
 * Validates password strength
 */
function validatePasswordStrength(password) {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  return { valid: true };
}

module.exports = {
  hashPassword,
  comparePassword,
  validatePasswordStrength
};

