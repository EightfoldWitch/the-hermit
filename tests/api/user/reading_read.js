/**
 * Test script for /reading/read API
 * User API - Requires authentication
 * Url Params: key - (string)|'last'
 */

const { apiRequest, printTestResult } = require('../helpers');

async function testReadingRead(sessionToken, readingKey) {
  console.log('Testing /reading/read API...\n');
  
  if (!sessionToken) {
    console.log('✗ Skipping test - no session token provided');
    console.log('  Run users_login.js first to get a session token\n');
    return false;
  }
  
  // Test 1: Read last reading
  const result1 = await apiRequest('GET', '/reading/read', {
    sessionToken,
    query: {
      key: 'last'
    }
  });
  const success1 = printTestResult('GET /reading/read?key=last', result1, true);
  
  // Test 2: Read specific reading by key
  if (readingKey) {
    const result2 = await apiRequest('GET', '/reading/read', {
      sessionToken,
      query: {
        key: readingKey
      }
    });
    const success2 = printTestResult(`GET /reading/read?key=${readingKey}`, result2, true);
    
    // Test 3: Read non-existent reading (should fail)
    const result3 = await apiRequest('GET', '/reading/read', {
      sessionToken,
      query: {
        key: '999999'
      }
    });
    const success3 = printTestResult('GET /reading/read?key=999999 (non-existent)', result3, false);
    
    // Test 4: Read without authentication (should fail)
    const result4 = await apiRequest('GET', '/reading/read', {
      query: {
        key: readingKey
      }
    });
    const success4 = printTestResult('GET /reading/read (no auth)', result4, false);
    
    return success1 && success2 && success3 && success4;
  } else {
    console.log('  Note: Skipping specific reading key tests (no reading key provided)\n');
    return success1;
  }
}

// Run test if executed directly
if (require.main === module) {
  const sessionToken = process.argv[2] || process.env.SESSION_TOKEN;
  const readingKey = process.argv[3] || process.env.READING_KEY;
  
  if (!sessionToken) {
    console.error('Usage: node reading_read.js <session_token> [reading_key]');
    console.error('Or set SESSION_TOKEN and READING_KEY environment variables');
    process.exit(1);
  }
  
  testReadingRead(sessionToken, readingKey)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testReadingRead };


