const pool = require('../server/config/database');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function getSaltKey() {
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
    fs.writeFileSync(fullPath, saltKey);
    return saltKey;
  }
  
  return fs.readFileSync(fullPath, 'utf8').trim();
}

async function hashPassword(password, saltKey) {
  const combined = password + saltKey;
  return await bcrypt.hash(combined, 10);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error('Usage: node create_user.js <user_id> <email> <password> [name] [role] [state]');
    console.error('Example: node create_user.js john john@example.com password123 "John Doe" admin Active');
    process.exit(1);
  }

  const [userId, email, password, name, role = 'user', state = 'Pending'] = args;

  try {
    const saltKey = await getSaltKey();
    const hashedPassword = await hashPassword(password, saltKey);

    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO Users (users_id, users_email, users_name, users_role, users_password, users_state)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING users_key, users_id, users_email, users_name, users_role, users_state`,
        [userId, email, name || null, role, hashedPassword, state]
      );

      console.log('User created successfully:');
      console.log(JSON.stringify(result.rows[0], null, 2));
    } finally {
      client.release();
    }

    process.exit(0);
  } catch (error) {
    console.error('Error creating user:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

