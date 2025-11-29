const { deleteTables } = require('../server/config/schema');
const pool = require('../server/config/database');

async function main() {
  try {
    console.log('Deleting all tables...');
    await deleteTables();
    console.log('All tables deleted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error deleting tables:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

