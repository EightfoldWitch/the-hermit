/**
 * Test script for /reading/list API
 * User API - Requires authentication
 */

const { apiRequest, printTestResult } = require('../helpers');

async function testReadingList(sessionToken) {
  console.log('Testing /reading/list API...\n');
  
  if (!sessionToken) {
    console.log('✗ Skipping test - no session token provided');
    console.log('  Run users_login.js first to get a session token\n');
    return false;
  }
  
  // Test 1: List all readings
  const result1 = await apiRequest('GET', '/reading/list', {
    sessionToken
  });
  const success1 = printTestResult('GET /reading/list (all readings)', result1, true);
  
  // Test 2: List readings with limit
  const result2 = await apiRequest('GET', '/reading/list', {
    sessionToken,
    query: {
      limit: 5
    }
  });
  const success2 = printTestResult('GET /reading/list (with limit)', result2, true);
  
  // Test 3: List readings with sort
  const result3 = await apiRequest('GET', '/reading/list', {
    sessionToken,
    query: {
      sort: 'recent',
      count: 3
    }
  });
  const success3 = printTestResult('GET /reading/list (sorted recent)', result3, true);
  
  // Test 4: List readings without authentication (should fail)
  const result4 = await apiRequest('GET', '/reading/list');
  const success4 = printTestResult('GET /reading/list (no auth)', result4, false);
  
  return success1 && success2 && success3 && success4;
}

// Run test if executed directly
if (require.main === module) {
  const sessionToken = process.argv[2] || process.env.SESSION_TOKEN;
  
  if (!sessionToken) {
    console.error('Usage: node reading_list.js <session_token>');
    console.error('Or set SESSION_TOKEN environment variable');
    process.exit(1);
  }
  
  testReadingList(sessionToken)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testReadingList };


