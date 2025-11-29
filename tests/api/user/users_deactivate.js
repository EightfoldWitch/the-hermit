/**
 * Test script for /users/deactivate API
 * User API - Requires authentication
 */

const { apiRequest, printTestResult } = require('../helpers');

async function testDeactivate(sessionToken) {
  console.log('Testing /users/deactivate API...\n');
  
  if (!sessionToken) {
    console.log('✗ Skipping test - no session token provided');
    console.log('  Run users_login.js first to get a session token\n');
    return false;
  }
  
  // Test 1: Deactivate user account
  const result1 = await apiRequest('POST', '/users/deactivate', {
    sessionToken
  });
  const success1 = printTestResult('POST /users/deactivate', result1, true);
  
  return success1;
}

// Run test if executed directly
if (require.main === module) {
  const sessionToken = process.argv[2] || process.env.SESSION_TOKEN;
  
  if (!sessionToken) {
    console.error('Usage: node users_deactivate.js <session_token>');
    console.error('Or set SESSION_TOKEN environment variable');
    process.exit(1);
  }
  
  testDeactivate(sessionToken)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testDeactivate };


