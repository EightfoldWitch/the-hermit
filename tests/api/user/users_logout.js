/**
 * Test script for /users/logout API
 * User API - Requires authentication
 */

const { apiRequest, printTestResult, setVerbosity } = require('../helpers');

async function testLogout(sessionToken, verbosity = 1) {
  if (verbosity >= 1) {
    console.log('Testing /users/logout API...\n');
  }
  
  if (!sessionToken) {
    if (verbosity >= 1) {
      console.log('✗ Skipping test - no session token provided');
      console.log('  Run users_login.js first to get a session token\n');
    }
    return false;
  }
  
  // Test 1: Logout with valid session token
  const result1 = await apiRequest('POST', '/users/logout', {
    sessionToken,
    verbosity
  });
  const success1 = printTestResult('POST /users/logout (valid session)', result1, true, verbosity);
  
  // Test 2: Try to logout again (should fail - session already deleted)
  const result2 = await apiRequest('POST', '/users/logout', {
    sessionToken,
    verbosity
  });
  const success2 = printTestResult('POST /users/logout (already logged out)', result2, false, verbosity);
  
  // Test 3: Logout with invalid session token (should fail)
  const result3 = await apiRequest('POST', '/users/logout', {
    sessionToken: 'invalid_token_12345',
    verbosity
  });
  const success3 = printTestResult('POST /users/logout (invalid token)', result3, false, verbosity);
  
  return success1 && success2 && success3;
}

// Run test if executed directly
if (require.main === module) {
  const sessionToken = process.argv[2] || process.env.SESSION_TOKEN;
  const verbosity = process.argv[3] !== undefined ? parseInt(process.argv[3], 10) : 
                    (process.env.VERBOSITY ? parseInt(process.env.VERBOSITY, 10) : 1);
  setVerbosity(verbosity);
  
  if (!sessionToken) {
    console.error('Usage: node users_logout.js <session_token> [verbosity]');
    console.error('Or set SESSION_TOKEN environment variable');
    process.exit(1);
  }
  
  testLogout(sessionToken, verbosity)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testLogout };


