/**
 * Test script for /reading/delete API
 * User API - Requires authentication
 */

const { apiRequest, printTestResult } = require('../helpers');

async function testReadingDelete(sessionToken, readingKey) {
  console.log('Testing /reading/delete API...\n');
  
  if (!sessionToken) {
    console.log('✗ Skipping test - no session token provided');
    console.log('  Run users_login.js first to get a session token\n');
    return false;
  }
  
  if (!readingKey) {
    console.log('✗ Skipping test - no reading key provided');
    console.log('  Run reading_create.js first to get a reading key\n');
    return false;
  }
  
  // Test 1: Delete a reading
  const result1 = await apiRequest('POST', '/reading/delete', {
    sessionToken,
    body: {
      readings_key: readingKey
    }
  });
  const success1 = printTestResult('POST /reading/delete (delete reading)', result1, true);
  
  // Test 2: Try to delete already deleted reading (should fail)
  const result2 = await apiRequest('POST', '/reading/delete', {
    sessionToken,
    body: {
      readings_key: readingKey
    }
  });
  const success2 = printTestResult('POST /reading/delete (already deleted)', result2, false);
  
  // Test 3: Delete with missing fields (should fail)
  const result3 = await apiRequest('POST', '/reading/delete', {
    sessionToken,
    body: {}
  });
  const success3 = printTestResult('POST /reading/delete (missing fields)', result3, false);
  
  return success1 && success2 && success3;
}

// Run test if executed directly
if (require.main === module) {
  const sessionToken = process.argv[2] || process.env.SESSION_TOKEN;
  const readingKey = process.argv[3] || process.env.READING_KEY;
  
  if (!sessionToken || !readingKey) {
    console.error('Usage: node reading_delete.js <session_token> <reading_key>');
    console.error('Or set SESSION_TOKEN and READING_KEY environment variables');
    process.exit(1);
  }
  
  testReadingDelete(sessionToken, readingKey)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testReadingDelete };


