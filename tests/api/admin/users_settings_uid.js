/**
 * Test script for /users/settings/{uid} API
 * Admin API - Requires admin role + authentication
 */

const { apiRequest, printTestResult } = require('../helpers');

async function testUsersSettingsUid(adminSessionToken, targetUserId) {
  console.log('Testing /users/settings/{uid} API (Admin)...\n');
  
  if (!adminSessionToken) {
    console.log('✗ Skipping test - no admin session token provided');
    console.log('  Run users_login.js with admin credentials first\n');
    return false;
  }
  
  if (!targetUserId) {
    console.log('  Note: No target user ID provided, using default test value\n');
    targetUserId = '2'; // Default test user ID
  }
  
  // Test 1: Get user settings by user key
  const result1 = await apiRequest('GET', `/users/settings/${targetUserId}`, {
    sessionToken: adminSessionToken
  });
  const success1 = printTestResult(`GET /users/settings/${targetUserId}`, result1, true);
  
  // Test 2: Update user settings
  const testSettings = {
    tiles_config: {
      tiles: [
        { type: 'last_reading', position: 0 },
        { type: 'reading_history', position: 1 }
      ]
    }
  };
  
  const result2 = await apiRequest('POST', `/users/settings/${targetUserId}`, {
    sessionToken: adminSessionToken,
    body: testSettings
  });
  const success2 = printTestResult(`POST /users/settings/${targetUserId} (update)`, result2, true);
  
  // Test 3: Get updated settings to verify
  const result3 = await apiRequest('GET', `/users/settings/${targetUserId}`, {
    sessionToken: adminSessionToken
  });
  const success3 = printTestResult(`GET /users/settings/${targetUserId} (verify)`, result3, true);
  
  // Test 4: Update settings without admin role (should fail)
  const result4 = await apiRequest('POST', `/users/settings/${targetUserId}`, {
    sessionToken: 'non_admin_token',
    body: testSettings
  });
  const success4 = printTestResult('POST /users/settings/{uid} (non-admin)', result4, false);
  
  return success1 && success2 && success3 && success4;
}

// Run test if executed directly
if (require.main === module) {
  const adminSessionToken = process.argv[2] || process.env.ADMIN_SESSION_TOKEN;
  const targetUserId = process.argv[3] || process.env.TARGET_USER_ID;
  
  if (!adminSessionToken) {
    console.error('Usage: node users_settings_uid.js <admin_session_token> [target_user_id]');
    console.error('Or set ADMIN_SESSION_TOKEN and TARGET_USER_ID environment variables');
    process.exit(1);
  }
  
  testUsersSettingsUid(adminSessionToken, targetUserId)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testUsersSettingsUid };


