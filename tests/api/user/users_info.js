/**
 * Test script for /users/info API
 * User API - Requires authentication
 */

const { apiRequest, printTestResult } = require('../helpers');

async function testUserInfo(sessionToken) {
  console.log('Testing /users/info API...\n');
  
  if (!sessionToken) {
    console.log('✗ Skipping test - no session token provided');
    console.log('  Run users_login.js first to get a session token\n');
    return false;
  }
  
  // Test 1: Get user info with valid session token
  const result1 = await apiRequest('GET', '/users/info', {
    sessionToken
  });
  const success1 = printTestResult('GET /users/info (valid session)', result1, true);
  
  // Test 2: Get user info with invalid session token (should fail)
  const result2 = await apiRequest('GET', '/users/info', {
    sessionToken: 'invalid_token_12345'
  });
  const success2 = printTestResult('GET /users/info (invalid token)', result2, false);
  
  // Test 3: Get user info without session token (should fail)
  const result3 = await apiRequest('GET', '/users/info');
  const success3 = printTestResult('GET /users/info (no token)', result3, false);
  
  return success1 && success2 && success3;
}

// Run test if executed directly
if (require.main === module) {
  const sessionToken = process.argv[2] || process.env.SESSION_TOKEN;
  
  if (!sessionToken) {
    console.error('Usage: node users_info.js <session_token>');
    console.error('Or set SESSION_TOKEN environment variable');
    process.exit(1);
  }
  
  testUserInfo(sessionToken)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testUserInfo };


