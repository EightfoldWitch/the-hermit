/**
 * Test script for /status API
 * Open API - No authentication required
 */

const { apiRequest, printTestResult, setVerbosity } = require('../helpers');

async function testStatus(verbosity = 1) {
  if (verbosity >= 1) {
    console.log('Testing /status API...\n');
  }
  
  const result = await apiRequest('GET', '/status', { verbosity });
  return printTestResult('GET /status', result, true, verbosity);
}

// Run test if executed directly
if (require.main === module) {
  // Parse verbosity from command line: node status.js [verbosity]
  const verbosity = process.argv[2] !== undefined ? parseInt(process.argv[2], 10) : 
                    (process.env.VERBOSITY ? parseInt(process.env.VERBOSITY, 10) : 1);
  setVerbosity(verbosity);
  
  testStatus(verbosity)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testStatus };


