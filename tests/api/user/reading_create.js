/**
 * Test script for /reading/create API
 * User API - Requires authentication
 */

const { apiRequest, printTestResult, setVerbosity } = require('../helpers');

async function testReadingCreate(sessionToken, verbosity = 1) {
  if (verbosity >= 1) {
    console.log('Testing /reading/create API...\n');
  }
  
  if (!sessionToken) {
    if (verbosity >= 1) {
      console.log('✗ Skipping test - no session token provided');
      console.log('  Run users_login.js first to get a session token\n');
    }
    return { success: false, readingKey: null };
  }
  
  // Test 1: Create a reading with all fields
  const testReading = {
    spread_key: 1, // Assuming spread_key 1 exists
    cards: [
      { card_id: 1, spread_position: 0 },
      { card_id: 2, spread_position: 1 },
      { card_id: 3, spread_position: 2 }
    ],
    impressions: ['First impression', 'Second impression'],
    tags: ['daily', 'guidance']
  };
  
  const result1 = await apiRequest('POST', '/reading/create', {
    sessionToken,
    body: testReading,
    verbosity
  });
  const success1 = printTestResult('POST /reading/create (full data)', result1, true, verbosity);
  
  // Store reading key if successful
  let readingKey = null;
  if (result1.data && result1.data.reading && result1.data.reading.readings_key) {
    readingKey = result1.data.reading.readings_key;
    if (verbosity >= 1) {
      console.log(`   Reading key: ${readingKey}\n`);
    }
  }
  
  // Test 2: Create a reading with minimal data
  const minimalReading = {
    spread_key: 1,
    cards: [
      { card_id: 4, spread_position: 0 }
    ]
  };
  
  const result2 = await apiRequest('POST', '/reading/create', {
    sessionToken,
    body: minimalReading,
    verbosity
  });
  const success2 = printTestResult('POST /reading/create (minimal data)', result2, true, verbosity);
  
  // Test 3: Create reading with missing required fields (should fail)
  const result3 = await apiRequest('POST', '/reading/create', {
    sessionToken,
    body: {
      // Missing spread_key and cards
    },
    verbosity
  });
  const success3 = printTestResult('POST /reading/create (missing fields)', result3, false, verbosity);
  
  return {
    success: success1 && success2 && success3,
    readingKey
  };
}

// Run test if executed directly
if (require.main === module) {
  const sessionToken = process.argv[2] || process.env.SESSION_TOKEN;
  const verbosity = process.argv[3] !== undefined ? parseInt(process.argv[3], 10) : 
                    (process.env.VERBOSITY ? parseInt(process.env.VERBOSITY, 10) : 1);
  setVerbosity(verbosity);
  
  if (!sessionToken) {
    console.error('Usage: node reading_create.js <session_token> [verbosity]');
    console.error('Or set SESSION_TOKEN environment variable');
    process.exit(1);
  }
  
  testReadingCreate(sessionToken, verbosity)
    .then(({ success, readingKey }) => {
      if (readingKey && verbosity >= 1) {
        console.log(`\nReading key for subsequent tests: ${readingKey}`);
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testReadingCreate };


