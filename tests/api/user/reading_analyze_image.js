/**
 * Test script for /reading/analyze_image API
 * User API - Requires authentication
 */

const { apiRequest, printTestResult } = require('../helpers');
const fs = require('fs');
const path = require('path');

async function testReadingAnalyzeImage(sessionToken) {
  console.log('Testing /reading/analyze_image API...\n');
  
  if (!sessionToken) {
    console.log('✗ Skipping test - no session token provided');
    console.log('  Run users_login.js first to get a session token\n');
    return false;
  }
  
  // Test 1: Analyze an image (base64 encoded)
  // Note: This is a placeholder - actual implementation may vary
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='; // 1x1 pixel PNG
  
  const result1 = await apiRequest('POST', '/reading/analyze_image', {
    sessionToken,
    body: {
      image: testImageBase64,
      image_format: 'base64'
    }
  });
  const success1 = printTestResult('POST /reading/analyze_image (base64 image)', result1, true);
  
  // Test 2: Analyze image with missing fields (should fail)
  const result2 = await apiRequest('POST', '/reading/analyze_image', {
    sessionToken,
    body: {}
  });
  const success2 = printTestResult('POST /reading/analyze_image (missing fields)', result2, false);
  
  return success1 && success2;
}

// Run test if executed directly
if (require.main === module) {
  const sessionToken = process.argv[2] || process.env.SESSION_TOKEN;
  
  if (!sessionToken) {
    console.error('Usage: node reading_analyze_image.js <session_token>');
    console.error('Or set SESSION_TOKEN environment variable');
    process.exit(1);
  }
  
  testReadingAnalyzeImage(sessionToken)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testReadingAnalyzeImage };


