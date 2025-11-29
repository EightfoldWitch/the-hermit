/**
 * Test script for /msgs/list API
 * User API - Requires authentication
 * Url Params: type - [count|list], filter - [unread|all]
 */

const { apiRequest, printTestResult } = require('../helpers');

async function testMsgsList(sessionToken) {
  console.log('Testing /msgs/list API...\n');
  
  if (!sessionToken) {
    console.log('✗ Skipping test - no session token provided');
    console.log('  Run users_login.js first to get a session token\n');
    return false;
  }
  
  // Test 1: Get message count (unread)
  const result1 = await apiRequest('GET', '/msgs/list', {
    sessionToken,
    query: {
      type: 'count',
      filter: 'unread'
    }
  });
  const success1 = printTestResult('GET /msgs/list?type=count&filter=unread', result1, true);
  
  // Test 2: Get message list (all)
  const result2 = await apiRequest('GET', '/msgs/list', {
    sessionToken,
    query: {
      type: 'list',
      filter: 'all'
    }
  });
  const success2 = printTestResult('GET /msgs/list?type=list&filter=all', result2, true);
  
  // Test 3: Get message list (unread)
  const result3 = await apiRequest('GET', '/msgs/list', {
    sessionToken,
    query: {
      type: 'list',
      filter: 'unread'
    }
  });
  const success3 = printTestResult('GET /msgs/list?type=list&filter=unread', result3, true);
  
  // Test 4: Get messages without authentication (should fail)
  const result4 = await apiRequest('GET', '/msgs/list', {
    query: {
      type: 'count',
      filter: 'unread'
    }
  });
  const success4 = printTestResult('GET /msgs/list (no auth)', result4, false);
  
  return success1 && success2 && success3 && success4;
}

// Run test if executed directly
if (require.main === module) {
  const sessionToken = process.argv[2] || process.env.SESSION_TOKEN;
  
  if (!sessionToken) {
    console.error('Usage: node msgs_list.js <session_token>');
    console.error('Or set SESSION_TOKEN environment variable');
    process.exit(1);
  }
  
  testMsgsList(sessionToken)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testMsgsList };


