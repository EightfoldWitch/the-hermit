const { createTables } = require('../server/config/schema');
const pool = require('../server/config/database');

async function main() {
  try {
    console.log('Creating database tables...');
    await createTables();
    console.log('Database tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

