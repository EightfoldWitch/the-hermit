/**
 * Test script for /reading/stats/cards API
 * User API - Requires authentication
 * Url Params: limit - (int), range - [month]
 */

const { apiRequest, printTestResult } = require('../helpers');

async function testReadingStatsCards(sessionToken) {
  console.log('Testing /reading/stats/cards API...\n');
  
  if (!sessionToken) {
    console.log('✗ Skipping test - no session token provided');
    console.log('  Run users_login.js first to get a session token\n');
    return false;
  }
  
  // Test 1: Get card stats with limit
  const result1 = await apiRequest('GET', '/reading/stats/cards', {
    sessionToken,
    query: {
      limit: 5
    }
  });
  const success1 = printTestResult('GET /reading/stats/cards?limit=5', result1, true);
  
  // Test 2: Get card stats with range
  const result2 = await apiRequest('GET', '/reading/stats/cards', {
    sessionToken,
    query: {
      limit: 10,
      range: 'month'
    }
  });
  const success2 = printTestResult('GET /reading/stats/cards?limit=10&range=month', result2, true);
  
  // Test 3: Get card stats without limit
  const result3 = await apiRequest('GET', '/reading/stats/cards', {
    sessionToken
  });
  const success3 = printTestResult('GET /reading/stats/cards (no params)', result3, true);
  
  // Test 4: Get stats without authentication (should fail)
  const result4 = await apiRequest('GET', '/reading/stats/cards', {
    query: {
      limit: 5
    }
  });
  const success4 = printTestResult('GET /reading/stats/cards (no auth)', result4, false);
  
  return success1 && success2 && success3 && success4;
}

// Run test if executed directly
if (require.main === module) {
  const sessionToken = process.argv[2] || process.env.SESSION_TOKEN;
  
  if (!sessionToken) {
    console.error('Usage: node reading_stats_cards.js <session_token>');
    console.error('Or set SESSION_TOKEN environment variable');
    process.exit(1);
  }
  
  testReadingStatsCards(sessionToken)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testReadingStatsCards };


