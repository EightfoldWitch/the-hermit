# API Test Scripts

This directory contains test scripts for all APIs listed in the base specification.

## Structure

```
tests/api/
├── helpers.js              # Shared utilities for API testing
├── run_all.js              # Test runner that executes all tests
├── README.md               # This file
├── open/                   # Open APIs (no authentication)
│   ├── status.js
│   ├── users_register.js
│   ├── users_login.js
│   └── users_forgot_password.js
├── user/                   # User APIs (require authentication)
│   ├── users_logout.js
│   ├── users_deactivate.js
│   ├── users_info.js
│   ├── users_settings.js
│   ├── users_tiles.js
│   ├── reading_create.js
│   ├── reading_edit.js
│   ├── reading_share.js
│   ├── reading_delete.js
│   ├── reading_analyze_image.js
│   ├── reading_list.js
│   ├── reading_read.js
│   ├── reading_impressions.js
│   ├── reading_stats.js
│   ├── reading_stats_cards.js
│   ├── msgs_list.js
│   ├── msgs_users.js
│   └── msgs_user_uid.js
└── admin/                  # Admin APIs (require admin role)
    ├── users_list.js
    ├── users_disable.js
    ├── users_info_uid.js
    └── users_settings_uid.js
```

## Usage

### Running Individual Tests

Each test script can be run independently:

```bash
# Open APIs (no authentication required)
node tests/api/open/status.js
node tests/api/open/users_register.js
node tests/api/open/users_login.js

# User APIs (require session token)
node tests/api/user/users_info.js <session_token>
node tests/api/user/reading_create.js <session_token>

# Admin APIs (require admin session token)
node tests/api/admin/users_list.js <admin_session_token>
```

### Running All Tests

Use the test runner to execute all tests:

```bash
node tests/api/run_all.js
```

### Environment Variables

You can set environment variables to avoid passing tokens as arguments:

```bash
# Set API base URL (default: http://localhost:3000)
export API_BASE_URL=http://localhost:3000

# Set session token for user API tests
export SESSION_TOKEN=your_session_token_here

# Set admin session token for admin API tests
export ADMIN_SESSION_TOKEN=your_admin_session_token_here

# Set reading key for reading-specific tests
export READING_KEY=your_reading_key_here

# Set target user ID for admin tests
export TARGET_USER_ID=target_user_key_here
```

### Example Workflow

1. Start the server:
   ```bash
   npm start
   ```

2. Run open API tests:
   ```bash
   node tests/api/open/status.js
   node tests/api/open/users_login.js
   ```

3. Get session token from login test output, then run user API tests:
   ```bash
   export SESSION_TOKEN=<token_from_login>
   node tests/api/user/users_info.js
   node tests/api/user/reading_list.js
   ```

4. For admin tests, login as admin first:
   ```bash
   node tests/api/open/users_login.js
   # Copy admin session token
   export ADMIN_SESSION_TOKEN=<admin_token>
   node tests/api/admin/users_list.js
   ```

## Test Script Features

Each test script:
- Tests both success and failure cases
- Validates authentication requirements
- Tests with and without required parameters
- Provides colored output (✓ for pass, ✗ for fail)
- Can be run independently or as part of the test suite
- Returns appropriate exit codes (0 for success, 1 for failure)

## Helper Functions

The `helpers.js` file provides:

- `apiRequest(method, endpoint, options)` - Make HTTP requests to the API
- `printTestResult(testName, result, expectSuccess)` - Print formatted test results
- `BASE_URL` - Configurable API base URL

## Notes

- Tests assume the server is running on `http://localhost:3000` by default
- Some tests require existing data (e.g., users, readings) to work properly
- Tests that create data may leave test data in the database
- Admin tests require a user with admin role
- Some endpoints may not be fully implemented yet - tests will fail gracefully


