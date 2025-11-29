/**
 * Test script for /users/register API
 * Open API - No authentication required
 */

const { apiRequest, printTestResult, setVerbosity } = require('../helpers');

async function testRegister(verbosity = 1) {
  if (verbosity >= 1) {
    console.log('Testing /users/register API...\n');
  }
  
  // Test 1: Register a new user
  const testUser = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'TestPassword123!',
    name: 'Test User'
  };
  
  const result1 = await apiRequest('POST', '/users/register', {
    body: testUser,
    verbosity
  });
  const success1 = printTestResult('POST /users/register (new user)', result1, true, verbosity);
  
  // Test 2: Try to register duplicate user (should fail)
  const result2 = await apiRequest('POST', '/users/register', {
    body: testUser,
    verbosity
  });
  const success2 = printTestResult('POST /users/register (duplicate user)', result2, false, verbosity);
  
  // Test 3: Register with missing fields (should fail)
  const result3 = await apiRequest('POST', '/users/register', {
    body: {
      username: 'testuser2',
      // Missing email and password
    },
    verbosity
  });
  const success3 = printTestResult('POST /users/register (missing fields)', result3, false, verbosity);
  
  return success1 && success2 && success3;
}

// Run test if executed directly
if (require.main === module) {
  const verbosity = process.argv[2] !== undefined ? parseInt(process.argv[2], 10) : 
                    (process.env.VERBOSITY ? parseInt(process.env.VERBOSITY, 10) : 1);
  setVerbosity(verbosity);
  
  testRegister(verbosity)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testRegister };


