/**
 * Test script for /msgs/user/{uid} API
 * User API - Requires authentication
 */

const { apiRequest, printTestResult } = require('../helpers');

async function testMsgsUserUid(sessionToken, targetUserId) {
  console.log('Testing /msgs/user/{uid} API...\n');
  
  if (!sessionToken) {
    console.log('✗ Skipping test - no session token provided');
    console.log('  Run users_login.js first to get a session token\n');
    return false;
  }
  
  if (!targetUserId) {
    console.log('  Note: No target user ID provided, using default test value\n');
    targetUserId = '2'; // Default test user ID
  }
  
  // Test 1: Get messages from specific user
  const result1 = await apiRequest('GET', `/msgs/user/${targetUserId}`, {
    sessionToken
  });
  const success1 = printTestResult(`GET /msgs/user/${targetUserId}`, result1, true);
  
  // Test 2: Get messages with query parameters (if supported)
  const result2 = await apiRequest('GET', `/msgs/user/${targetUserId}`, {
    sessionToken,
    query: {
      limit: 10,
      offset: 0
    }
  });
  const success2 = printTestResult(`GET /msgs/user/${targetUserId}?limit=10&offset=0`, result2, true);
  
  // Test 3: Get messages without authentication (should fail)
  const result3 = await apiRequest('GET', `/msgs/user/${targetUserId}`);
  const success3 = printTestResult('GET /msgs/user/{uid} (no auth)', result3, false);
  
  return success1 && success2 && success3;
}

// Run test if executed directly
if (require.main === module) {
  const sessionToken = process.argv[2] || process.env.SESSION_TOKEN;
  const targetUserId = process.argv[3] || process.env.TARGET_USER_ID;
  
  if (!sessionToken) {
    console.error('Usage: node msgs_user_uid.js <session_token> [target_user_id]');
    console.error('Or set SESSION_TOKEN and TARGET_USER_ID environment variables');
    process.exit(1);
  }
  
  testMsgsUserUid(sessionToken, targetUserId)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testMsgsUserUid };


