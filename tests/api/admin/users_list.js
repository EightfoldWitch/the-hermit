/**
 * Test script for /users/list API
 * Admin API - Requires admin role + authentication
 */

const { apiRequest, printTestResult } = require('../helpers');

async function testUsersList(adminSessionToken) {
  console.log('Testing /users/list API (Admin)...\n');
  
  if (!adminSessionToken) {
    console.log('✗ Skipping test - no admin session token provided');
    console.log('  Run users_login.js with admin credentials first\n');
    return false;
  }
  
  // Test 1: List all users
  const result1 = await apiRequest('GET', '/users/list', {
    sessionToken: adminSessionToken
  });
  const success1 = printTestResult('GET /users/list (all users)', result1, true);
  
  // Test 2: List users with limit
  const result2 = await apiRequest('GET', '/users/list', {
    sessionToken: adminSessionToken,
    query: {
      limit: 10,
      offset: 0
    }
  });
  const success2 = printTestResult('GET /users/list?limit=10&offset=0', result2, true);
  
  // Test 3: List users without admin role (should fail)
  // Note: This requires a non-admin session token
  const result3 = await apiRequest('GET', '/users/list', {
    sessionToken: 'non_admin_token' // This will fail authentication
  });
  const success3 = printTestResult('GET /users/list (non-admin)', result3, false);
  
  // Test 4: List users without authentication (should fail)
  const result4 = await apiRequest('GET', '/users/list');
  const success4 = printTestResult('GET /users/list (no auth)', result4, false);
  
  return success1 && success2 && success3 && success4;
}

// Run test if executed directly
if (require.main === module) {
  const adminSessionToken = process.argv[2] || process.env.ADMIN_SESSION_TOKEN;
  
  if (!adminSessionToken) {
    console.error('Usage: node users_list.js <admin_session_token>');
    console.error('Or set ADMIN_SESSION_TOKEN environment variable');
    process.exit(1);
  }
  
  testUsersList(adminSessionToken)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testUsersList };


