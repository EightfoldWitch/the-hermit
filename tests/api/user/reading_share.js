/**
 * Test script for /reading/share API
 * User API - Requires authentication
 */

const { apiRequest, printTestResult } = require('../helpers');

async function testReadingShare(sessionToken, readingKey) {
  console.log('Testing /reading/share API...\n');
  
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
  
  // Test 1: Share a reading with another user
  const shareData = {
    readings_key: readingKey,
    users_shared_key: 2 // Assuming user key 2 exists
  };
  
  const result1 = await apiRequest('POST', '/reading/share', {
    sessionToken,
    body: shareData
  });
  const success1 = printTestResult('POST /reading/share (share reading)', result1, true);
  
  // Test 2: Share reading with missing fields (should fail)
  const result2 = await apiRequest('POST', '/reading/share', {
    sessionToken,
    body: {
      readings_key: readingKey
      // Missing users_shared_key
    }
  });
  const success2 = printTestResult('POST /reading/share (missing fields)', result2, false);
  
  return success1 && success2;
}

// Run test if executed directly
if (require.main === module) {
  const sessionToken = process.argv[2] || process.env.SESSION_TOKEN;
  const readingKey = process.argv[3] || process.env.READING_KEY;
  
  if (!sessionToken || !readingKey) {
    console.error('Usage: node reading_share.js <session_token> <reading_key>');
    console.error('Or set SESSION_TOKEN and READING_KEY environment variables');
    process.exit(1);
  }
  
  testReadingShare(sessionToken, readingKey)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testReadingShare };


