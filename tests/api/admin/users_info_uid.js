/**
 * Test script for /users/info/{uid} API
 * Admin API - Requires admin role + authentication
 */

const { apiRequest, printTestResult } = require('../helpers');

async function testUsersInfoUid(adminSessionToken, targetUserId) {
  console.log('Testing /users/info/{uid} API (Admin)...\n');
  
  if (!adminSessionToken) {
    console.log('✗ Skipping test - no admin session token provided');
    console.log('  Run users_login.js with admin credentials first\n');
    return false;
  }
  
  if (!targetUserId) {
    console.log('  Note: No target user ID provided, using default test value\n');
    targetUserId = '2'; // Default test user ID
  }
  
  // Test 1: Get user info by user key
  const result1 = await apiRequest('GET', `/users/info/${targetUserId}`, {
    sessionToken: adminSessionToken
  });
  const success1 = printTestResult(`GET /users/info/${targetUserId}`, result1, true);
  
  // Test 2: Get non-existent user info (should fail)
  const result2 = await apiRequest('GET', '/users/info/999999', {
    sessionToken: adminSessionToken
  });
  const success2 = printTestResult('GET /users/info/999999 (non-existent)', result2, false);
  
  // Test 3: Get user info without admin role (should fail)
  const result3 = await apiRequest('GET', `/users/info/${targetUserId}`, {
    sessionToken: 'non_admin_token'
  });
  const success3 = printTestResult('GET /users/info/{uid} (non-admin)', result3, false);
  
  // Test 4: Get user info without authentication (should fail)
  const result4 = await apiRequest('GET', `/users/info/${targetUserId}`);
  const success4 = printTestResult('GET /users/info/{uid} (no auth)', result4, false);
  
  return success1 && success2 && success3 && success4;
}

// Run test if executed directly
if (require.main === module) {
  const adminSessionToken = process.argv[2] || process.env.ADMIN_SESSION_TOKEN;
  const targetUserId = process.argv[3] || process.env.TARGET_USER_ID;
  
  if (!adminSessionToken) {
    console.error('Usage: node users_info_uid.js <admin_session_token> [target_user_id]');
    console.error('Or set ADMIN_SESSION_TOKEN and TARGET_USER_ID environment variables');
    process.exit(1);
  }
  
  testUsersInfoUid(adminSessionToken, targetUserId)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testUsersInfoUid };


