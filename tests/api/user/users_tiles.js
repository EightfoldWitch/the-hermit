/**
 * Test script for /users/tiles API
 * User API - Requires authentication
 * Updates the home tiles configuration for the user
 */

const { apiRequest, printTestResult } = require('../helpers');

async function testUserTiles(sessionToken) {
  console.log('Testing /users/tiles API...\n');
  
  if (!sessionToken) {
    console.log('✗ Skipping test - no session token provided');
    console.log('  Run users_login.js first to get a session token\n');
    return false;
  }
  
  // Test 1: Update tiles configuration
  const testTilesConfig = {
    tiles: [
      { type: 'last_reading', position: 0 },
      { type: 'reading_trends', position: 1 },
      { type: 'reading_most_common', position: 2 },
      { type: 'reading_history', position: 3 },
      { type: 'shared_readings', position: 4 },
      { type: 'recent_messages', position: 5 },
      { type: 'quick_reading', position: 6 }
    ]
  };
  
  const result1 = await apiRequest('POST', '/users/tiles', {
    sessionToken,
    body: testTilesConfig
  });
  const success1 = printTestResult('POST /users/tiles (update config)', result1, true);
  
  // Test 2: Get tiles configuration (if GET endpoint exists)
  // Note: This might use /users/settings instead
  const result2 = await apiRequest('GET', '/users/tiles', {
    sessionToken
  });
  // This might fail if GET doesn't exist, so we don't require success
  printTestResult('GET /users/tiles (get config)', result2, false);
  
  return success1;
}

// Run test if executed directly
if (require.main === module) {
  const sessionToken = process.argv[2] || process.env.SESSION_TOKEN;
  
  if (!sessionToken) {
    console.error('Usage: node users_tiles.js <session_token>');
    console.error('Or set SESSION_TOKEN environment variable');
    process.exit(1);
  }
  
  testUserTiles(sessionToken)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testUserTiles };


