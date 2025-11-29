/**
 * Test script for /users/forgot_password API
 * Open API - No authentication required
 */

const { apiRequest, printTestResult, setVerbosity } = require('../helpers');

async function testForgotPassword(verbosity = 1) {
  if (verbosity >= 1) {
    console.log('Testing /users/forgot_password API...\n');
  }
  
  // Test 1: Request password reset with email
  const result1 = await apiRequest('POST', '/users/forgot_password', {
    body: {
      email: 'test@example.com'
    },
    verbosity
  });
  const success1 = printTestResult('POST /users/forgot_password (with email)', result1, true, verbosity);
  
  // Test 2: Request password reset with username
  const result2 = await apiRequest('POST', '/users/forgot_password', {
    body: {
      username: 'testuser'
    },
    verbosity
  });
  const success2 = printTestResult('POST /users/forgot_password (with username)', result2, true, verbosity);
  
  // Test 3: Request with missing fields (should fail)
  const result3 = await apiRequest('POST', '/users/forgot_password', {
    body: {},
    verbosity
  });
  const success3 = printTestResult('POST /users/forgot_password (missing fields)', result3, false, verbosity);
  
  return success1 && success2 && success3;
}

// Run test if executed directly
if (require.main === module) {
  const verbosity = process.argv[2] !== undefined ? parseInt(process.argv[2], 10) : 
                    (process.env.VERBOSITY ? parseInt(process.env.VERBOSITY, 10) : 1);
  setVerbosity(verbosity);
  
  testForgotPassword(verbosity)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testForgotPassword };


