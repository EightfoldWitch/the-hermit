const { clearTables } = require('../server/config/schema');
const pool = require('../server/config/database');

async function main() {
  try {
    console.log('Clearing all tables...');
    await clearTables();
    console.log('All tables cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing tables:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

