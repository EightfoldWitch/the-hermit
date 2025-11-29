/**
 * Test script for /users/disable API
 * Admin API - Requires admin role + authentication
 */

const { apiRequest, printTestResult } = require('../helpers');

async function testUsersDisable(adminSessionToken, targetUserId) {
  console.log('Testing /users/disable API (Admin)...\n');
  
  if (!adminSessionToken) {
    console.log('✗ Skipping test - no admin session token provided');
    console.log('  Run users_login.js with admin credentials first\n');
    return false;
  }
  
  if (!targetUserId) {
    console.log('  Note: No target user ID provided, using default test value\n');
    targetUserId = '2'; // Default test user ID
  }
  
  // Test 1: Disable a user
  const result1 = await apiRequest('POST', '/users/disable', {
    sessionToken: adminSessionToken,
    body: {
      users_key: targetUserId,
      state: 'Disabled'
    }
  });
  const success1 = printTestResult(`POST /users/disable (disable user ${targetUserId})`, result1, true);
  
  // Test 2: Re-enable a user
  const result2 = await apiRequest('POST', '/users/disable', {
    sessionToken: adminSessionToken,
    body: {
      users_key: targetUserId,
      state: 'Active'
    }
  });
  const success2 = printTestResult(`POST /users/disable (enable user ${targetUserId})`, result2, true);
  
  // Test 3: Disable user with missing fields (should fail)
  const result3 = await apiRequest('POST', '/users/disable', {
    sessionToken: adminSessionToken,
    body: {
      users_key: targetUserId
      // Missing state
    }
  });
  const success3 = printTestResult('POST /users/disable (missing fields)', result3, false);
  
  // Test 4: Disable user without admin role (should fail)
  const result4 = await apiRequest('POST', '/users/disable', {
    sessionToken: 'non_admin_token',
    body: {
      users_key: targetUserId,
      state: 'Disabled'
    }
  });
  const success4 = printTestResult('POST /users/disable (non-admin)', result4, false);
  
  return success1 && success2 && success3 && success4;
}

// Run test if executed directly
if (require.main === module) {
  const adminSessionToken = process.argv[2] || process.env.ADMIN_SESSION_TOKEN;
  const targetUserId = process.argv[3] || process.env.TARGET_USER_ID;
  
  if (!adminSessionToken) {
    console.error('Usage: node users_disable.js <admin_session_token> [target_user_id]');
    console.error('Or set ADMIN_SESSION_TOKEN and TARGET_USER_ID environment variables');
    process.exit(1);
  }
  
  testUsersDisable(adminSessionToken, targetUserId)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testUsersDisable };


