/**
 * Test script for /msgs/users API
 * User API - Requires authentication
 * Url Params: sort - [recent|count], limit - (number), type - [unread|all]
 */

const { apiRequest, printTestResult } = require('../helpers');

async function testMsgsUsers(sessionToken) {
  console.log('Testing /msgs/users API...\n');
  
  if (!sessionToken) {
    console.log('✗ Skipping test - no session token provided');
    console.log('  Run users_login.js first to get a session token\n');
    return false;
  }
  
  // Test 1: Get users sorted by recent
  const result1 = await apiRequest('GET', '/msgs/users', {
    sessionToken,
    query: {
      sort: 'recent',
      limit: 3,
      type: 'all'
    }
  });
  const success1 = printTestResult('GET /msgs/users?sort=recent&limit=3&type=all', result1, true);
  
  // Test 2: Get users sorted by count
  const result2 = await apiRequest('GET', '/msgs/users', {
    sessionToken,
    query: {
      sort: 'count',
      limit: 5,
      type: 'unread'
    }
  });
  const success2 = printTestResult('GET /msgs/users?sort=count&limit=5&type=unread', result2, true);
  
  // Test 3: Get users with summary type
  const result3 = await apiRequest('GET', '/msgs/users', {
    sessionToken,
    query: {
      sort: 'recent',
      limit: 3,
      type: 'summary'
    }
  });
  const success3 = printTestResult('GET /msgs/users?sort=recent&limit=3&type=summary', result3, true);
  
  // Test 4: Get users without authentication (should fail)
  const result4 = await apiRequest('GET', '/msgs/users', {
    query: {
      sort: 'recent',
      limit: 3
    }
  });
  const success4 = printTestResult('GET /msgs/users (no auth)', result4, false);
  
  return success1 && success2 && success3 && success4;
}

// Run test if executed directly
if (require.main === module) {
  const sessionToken = process.argv[2] || process.env.SESSION_TOKEN;
  
  if (!sessionToken) {
    console.error('Usage: node msgs_users.js <session_token>');
    console.error('Or set SESSION_TOKEN environment variable');
    process.exit(1);
  }
  
  testMsgsUsers(sessionToken)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testMsgsUsers };


