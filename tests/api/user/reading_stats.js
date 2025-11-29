/**
 * Test script for /reading/stats API
 * User API - Requires authentication
 * Url Params: type - [basic|card_count], limit - (int), range - [month]
 */

const { apiRequest, printTestResult } = require('../helpers');

async function testReadingStats(sessionToken) {
  console.log('Testing /reading/stats API...\n');
  
  if (!sessionToken) {
    console.log('✗ Skipping test - no session token provided');
    console.log('  Run users_login.js first to get a session token\n');
    return false;
  }
  
  // Test 1: Get basic stats
  const result1 = await apiRequest('GET', '/reading/stats', {
    sessionToken,
    query: {
      type: 'basic'
    }
  });
  const success1 = printTestResult('GET /reading/stats?type=basic', result1, true);
  
  // Test 2: Get card count stats
  const result2 = await apiRequest('GET', '/reading/stats', {
    sessionToken,
    query: {
      type: 'card_count',
      limit: 5
    }
  });
  const success2 = printTestResult('GET /reading/stats?type=card_count&limit=5', result2, true);
  
  // Test 3: Get stats with range
  const result3 = await apiRequest('GET', '/reading/stats', {
    sessionToken,
    query: {
      type: 'basic',
      range: 'month'
    }
  });
  const success3 = printTestResult('GET /reading/stats?type=basic&range=month', result3, true);
  
  // Test 4: Get stats without authentication (should fail)
  const result4 = await apiRequest('GET', '/reading/stats', {
    query: {
      type: 'basic'
    }
  });
  const success4 = printTestResult('GET /reading/stats (no auth)', result4, false);
  
  return success1 && success2 && success3 && success4;
}

// Run test if executed directly
if (require.main === module) {
  const sessionToken = process.argv[2] || process.env.SESSION_TOKEN;
  
  if (!sessionToken) {
    console.error('Usage: node reading_stats.js <session_token>');
    console.error('Or set SESSION_TOKEN environment variable');
    process.exit(1);
  }
  
  testReadingStats(sessionToken)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testReadingStats };


