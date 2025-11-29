/**
 * Test script for /users/settings API
 * User API - Requires authentication
 */

const { apiRequest, printTestResult } = require('../helpers');

async function testUserSettings(sessionToken) {
  console.log('Testing /users/settings API...\n');
  
  if (!sessionToken) {
    console.log('✗ Skipping test - no session token provided');
    console.log('  Run users_login.js first to get a session token\n');
    return false;
  }
  
  // Test 1: Get user settings
  const result1 = await apiRequest('GET', '/users/settings', {
    sessionToken
  });
  const success1 = printTestResult('GET /users/settings', result1, true);
  
  // Test 2: Update user settings
  const testSettings = {
    tiles_config: {
      tiles: [
        { type: 'last_reading', position: 0 },
        { type: 'reading_history', position: 1 }
      ]
    }
  };
  
  const result2 = await apiRequest('POST', '/users/settings', {
    sessionToken,
    body: testSettings
  });
  const success2 = printTestResult('POST /users/settings (update)', result2, true);
  
  // Test 3: Get updated settings to verify
  const result3 = await apiRequest('GET', '/users/settings', {
    sessionToken
  });
  const success3 = printTestResult('GET /users/settings (verify update)', result3, true);
  
  return success1 && success2 && success3;
}

// Run test if executed directly
if (require.main === module) {
  const sessionToken = process.argv[2] || process.env.SESSION_TOKEN;
  
  if (!sessionToken) {
    console.error('Usage: node users_settings.js <session_token>');
    console.error('Or set SESSION_TOKEN environment variable');
    process.exit(1);
  }
  
  testUserSettings(sessionToken)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testUserSettings };


