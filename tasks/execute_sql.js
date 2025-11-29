const pool = require('../server/config/database');
const fs = require('fs');

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: node execute_sql.js <sql_file> OR node execute_sql.js --query "SELECT * FROM Users"');
    process.exit(1);
  }

  try {
    const client = await pool.connect();
    
    try {
      let sql;
      
      if (args[0] === '--query' && args[1]) {
        sql = args[1];
      } else {
        // Read SQL from file
        const sqlFile = args[0];
        if (!fs.existsSync(sqlFile)) {
          console.error(`SQL file not found: ${sqlFile}`);
          process.exit(1);
        }
        sql = fs.readFileSync(sqlFile, 'utf8');
      }

      console.log('Executing SQL...');
      console.log('---');
      console.log(sql);
      console.log('---');

      const result = await client.query(sql);
      
      if (result.rows && result.rows.length > 0) {
        console.log('\nResults:');
        console.log(JSON.stringify(result.rows, null, 2));
      } else {
        console.log('\nQuery executed successfully.');
        if (result.rowCount !== undefined) {
          console.log(`Rows affected: ${result.rowCount}`);
        }
      }
    } finally {
      client.release();
    }

    process.exit(0);
  } catch (error) {
    console.error('Error executing SQL:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

