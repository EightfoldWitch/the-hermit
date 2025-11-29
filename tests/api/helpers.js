/**
 * Helper utilities for API testing
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Default verbosity level (1 = response info)
let globalVerbosity = parseInt(process.env.VERBOSITY || '1', 10);

/**
 * Set the global verbosity level
 * @param {number} level - Verbosity level (0, 1, or 2)
 */
function setVerbosity(level) {
  globalVerbosity = parseInt(level, 10);
  if (isNaN(globalVerbosity) || globalVerbosity < 0 || globalVerbosity > 2) {
    globalVerbosity = 1;
  }
}

/**
 * Get the current verbosity level
 * @returns {number} Current verbosity level
 */
function getVerbosity() {
  return globalVerbosity;
}

/**
 * Make an API request
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {string} endpoint - API endpoint path
 * @param {object} options - Request options
 * @param {object} options.headers - Additional headers
 * @param {object} options.body - Request body (for POST/PUT)
 * @param {object} options.query - Query parameters
 * @param {string} options.sessionToken - Session token for authentication
 * @param {number} options.verbosity - Verbosity level override (0, 1, or 2)
 * @returns {Promise<object>} Response object with status and data
 */
async function apiRequest(method, endpoint, options = {}) {
  const { headers = {}, body, query, sessionToken, verbosity } = options;
  const verbosityLevel = verbosity !== undefined ? verbosity : globalVerbosity;
  
  return new Promise((resolve) => {
    // Build URL with query parameters
    const urlObj = new URL(endpoint, BASE_URL);
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        urlObj.searchParams.append(key, value);
      });
    }

    // Log action if verbosity >= 2
    if (verbosityLevel >= 2) {
      console.log(`   → ${method} ${urlObj.pathname + urlObj.search}`);
      if (body) {
        console.log(`     Body: ${JSON.stringify(body, null, 2).split('\n').join('\n     ')}`);
      }
      if (sessionToken) {
        console.log(`     Auth: ${sessionToken.substring(0, 20)}...`);
      }
    }

    // Set up headers
    const requestHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };

    // Add session token if provided
    if (sessionToken) {
      requestHeaders['x-session-token'] = sessionToken;
    }

    // Determine HTTP module based on protocol
    const isHttps = urlObj.protocol === 'https:';
    const httpModule = isHttps ? https : http;

    // Build request body
    let requestBody = null;
    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      requestBody = JSON.stringify(body);
      requestHeaders['Content-Length'] = Buffer.byteLength(requestBody);
    }

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method,
      headers: requestHeaders
    };

    const req = httpModule.request(requestOptions, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        let data = {};
        try {
          if (responseData) {
            data = JSON.parse(responseData);
          }
        } catch (e) {
          // If response is not JSON, return as string
          data = responseData;
        }

        resolve({
          status: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 300,
          data
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        status: 0,
        ok: false,
        error: error.message,
        data: null
      });
    });

    if (requestBody) {
      req.write(requestBody);
    }

    req.end();
  });
}

/**
 * Test helper to print test results
 * @param {string} testName - Name of the test
 * @param {object} result - API response result
 * @param {boolean} expectSuccess - Whether success is expected
 * @param {number} verbosity - Verbosity level (0, 1, or 2)
 */
function printTestResult(testName, result, expectSuccess = true, verbosity = undefined) {
  const verbosityLevel = verbosity !== undefined ? verbosity : globalVerbosity;
  const success = expectSuccess ? result.ok : !result.ok;
  const status = success ? '✓' : '✗';
  const color = success ? '\x1b[32m' : '\x1b[31m';
  const reset = '\x1b[0m';
  
  // Extract error message or code for verbosity 0
  let errorInfo = '';
  if (!success && verbosityLevel === 0) {
    // Try to get error message from response data
    if (result.data) {
      if (result.data.error) {
        errorInfo = ` - ${result.data.error}`;
      } else if (result.data.message) {
        errorInfo = ` - ${result.data.message}`;
      } else if (typeof result.data === 'string') {
        errorInfo = ` - ${result.data}`;
      }
    }
    // If no error message in data, use status code or error property
    if (!errorInfo) {
      if (result.error) {
        errorInfo = ` - ${result.error}`;
      } else if (result.status && result.status >= 400) {
        errorInfo = ` - HTTP ${result.status}`;
      } else if (result.status === 0) {
        errorInfo = ` - Connection failed`;
      }
    }
  }
  
  // Level 0: Success/failure with error message/code on failure
  if (verbosityLevel === 0) {
    console.log(`${color}${status}${reset} ${testName}${errorInfo}`);
    return success;
  }
  
  // Level 1+: Include status and response info
  console.log(`${color}${status}${reset} ${testName}`);
  console.log(`   Status: ${result.status}`);
  
  if (verbosityLevel >= 1) {
    if (result.data) {
      console.log(`   Response:`, JSON.stringify(result.data, null, 2));
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  }
  
  console.log('');
  
  return success;
}

module.exports = {
  apiRequest,
  printTestResult,
  setVerbosity,
  getVerbosity,
  BASE_URL
};

