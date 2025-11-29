/**
 * Test script for /reading/impressions API
 * User API - Requires authentication
 * Url Params: key - (string)
 */

const { apiRequest, printTestResult } = require('../helpers');

async function testReadingImpressions(sessionToken, readingKey) {
  console.log('Testing /reading/impressions API...\n');
  
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
  
  // Test 1: Get impressions for a reading
  const result1 = await apiRequest('GET', '/reading/impressions', {
    sessionToken,
    query: {
      key: readingKey
    }
  });
  const success1 = printTestResult(`GET /reading/impressions?key=${readingKey}`, result1, true);
  
  // Test 2: Create a new impression
  const result2 = await apiRequest('POST', '/reading/impressions', {
    sessionToken,
    body: {
      readings_key: readingKey,
      impression_text: 'This is a test impression'
    }
  });
  const success2 = printTestResult('POST /reading/impressions (create)', result2, true);
  
  // Test 3: Get impressions again to verify creation
  const result3 = await apiRequest('GET', '/reading/impressions', {
    sessionToken,
    query: {
      key: readingKey
    }
  });
  const success3 = printTestResult('GET /reading/impressions (verify)', result3, true);
  
  // Test 4: Create impression with missing fields (should fail)
  const result4 = await apiRequest('POST', '/reading/impressions', {
    sessionToken,
    body: {
      readings_key: readingKey
      // Missing impression_text
    }
  });
  const success4 = printTestResult('POST /reading/impressions (missing fields)', result4, false);
  
  return success1 && success2 && success3 && success4;
}

// Run test if executed directly
if (require.main === module) {
  const sessionToken = process.argv[2] || process.env.SESSION_TOKEN;
  const readingKey = process.argv[3] || process.env.READING_KEY;
  
  if (!sessionToken || !readingKey) {
    console.error('Usage: node reading_impressions.js <session_token> <reading_key>');
    console.error('Or set SESSION_TOKEN and READING_KEY environment variables');
    process.exit(1);
  }
  
  testReadingImpressions(sessionToken, readingKey)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testReadingImpressions };


