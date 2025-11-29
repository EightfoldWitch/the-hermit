/**
 * Test script for /reading/edit API
 * User API - Requires authentication
 */

const { apiRequest, printTestResult } = require('../helpers');

async function testReadingEdit(sessionToken, readingKey) {
  console.log('Testing /reading/edit API...\n');
  
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
  
  // Test 1: Edit a reading
  const updatedReading = {
    readings_key: readingKey,
    spread_key: 1,
    cards: [
      { card_id: 5, spread_position: 0 },
      { card_id: 6, spread_position: 1 }
    ],
    impressions: ['Updated impression'],
    tags: ['updated', 'edited']
  };
  
  const result1 = await apiRequest('POST', '/reading/edit', {
    sessionToken,
    body: updatedReading
  });
  const success1 = printTestResult('POST /reading/edit (update reading)', result1, true);
  
  // Test 2: Edit reading with missing fields (should fail)
  const result2 = await apiRequest('POST', '/reading/edit', {
    sessionToken,
    body: {
      readings_key: readingKey
      // Missing spread_key and cards
    }
  });
  const success2 = printTestResult('POST /reading/edit (missing fields)', result2, false);
  
  // Test 3: Edit non-existent reading (should fail)
  const result3 = await apiRequest('POST', '/reading/edit', {
    sessionToken,
    body: {
      readings_key: 999999,
      spread_key: 1,
      cards: [{ card_id: 1, spread_position: 0 }]
    }
  });
  const success3 = printTestResult('POST /reading/edit (non-existent reading)', result3, false);
  
  return success1 && success2 && success3;
}

// Run test if executed directly
if (require.main === module) {
  const sessionToken = process.argv[2] || process.env.SESSION_TOKEN;
  const readingKey = process.argv[3] || process.env.READING_KEY;
  
  if (!sessionToken || !readingKey) {
    console.error('Usage: node reading_edit.js <session_token> <reading_key>');
    console.error('Or set SESSION_TOKEN and READING_KEY environment variables');
    process.exit(1);
  }
  
  testReadingEdit(sessionToken, readingKey)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testReadingEdit };


