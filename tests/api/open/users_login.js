/**
 * Test script for /users/login API
 * Open API - No authentication required
 */

const { apiRequest, printTestResult, setVerbosity } = require('../helpers');

async function testLogin(verbosity = 1) {
  if (verbosity >= 1) {
    console.log('Testing /users/login API...\n');
  }
  
  // Test 1: Login with valid credentials (requires existing user)
  // Note: This test assumes a user exists. You may need to create one first.
  const result1 = await apiRequest('POST', '/users/login', {
    body: {
      username: 'admin', // Change to an existing user
      password: 'password123' // Change to correct password
    },
    verbosity
  });
  const success1 = printTestResult('POST /users/login (valid credentials)', result1, true, verbosity);
  
  // Store session token if successful
  let sessionToken = null;
  if (result1.data && result1.data.session_key) {
    sessionToken = result1.data.session_key;
    if (verbosity >= 1) {
      console.log(`   Session token: ${sessionToken.substring(0, 20)}...\n`);
    }
  }
  
  // Test 2: Login with invalid credentials (should fail)
  const result2 = await apiRequest('POST', '/users/login', {
    body: {
      username: 'nonexistent',
      password: 'wrongpassword'
    },
    verbosity
  });
  const success2 = printTestResult('POST /users/login (invalid credentials)', result2, false, verbosity);
  
  // Test 3: Login with missing fields (should fail)
  const result3 = await apiRequest('POST', '/users/login', {
    body: {
      username: 'admin'
      // Missing password
    },
    verbosity
  });
  const success3 = printTestResult('POST /users/login (missing password)', result3, false, verbosity);
  
  return {
    success: success1 && success2 && success3,
    sessionToken
  };
}

// Run test if executed directly
if (require.main === module) {
  const verbosity = process.argv[2] !== undefined ? parseInt(process.argv[2], 10) : 
                    (process.env.VERBOSITY ? parseInt(process.env.VERBOSITY, 10) : 1);
  setVerbosity(verbosity);
  
  testLogin(verbosity)
    .then(({ success, sessionToken }) => {
      if (sessionToken && verbosity >= 1) {
        console.log(`\nSession token for subsequent tests: ${sessionToken}`);
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testLogin };


