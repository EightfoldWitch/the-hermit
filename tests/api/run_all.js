/**
 * Test runner script that runs all API tests
 * Usage: node run_all.js [verbosity]
 *   verbosity: 0 = success/failure only, 1 = with response info (default), 2 = all actions
 */

const { setVerbosity, getVerbosity } = require('./helpers');
const { testStatus } = require('./open/status');
const { testRegister } = require('./open/users_register');
const { testLogin } = require('./open/users_login');
const { testForgotPassword } = require('./open/users_forgot_password');
const { testLogout } = require('./user/users_logout');
const { testDeactivate } = require('./user/users_deactivate');
const { testUserInfo } = require('./user/users_info');
const { testUserSettings } = require('./user/users_settings');
const { testUserTiles } = require('./user/users_tiles');
const { testReadingCreate } = require('./user/reading_create');
const { testReadingEdit } = require('./user/reading_edit');
const { testReadingShare } = require('./user/reading_share');
const { testReadingDelete } = require('./user/reading_delete');
const { testReadingAnalyzeImage } = require('./user/reading_analyze_image');
const { testReadingList } = require('./user/reading_list');
const { testReadingRead } = require('./user/reading_read');
const { testReadingImpressions } = require('./user/reading_impressions');
const { testReadingStats } = require('./user/reading_stats');
const { testReadingStatsCards } = require('./user/reading_stats_cards');
const { testMsgsList } = require('./user/msgs_list');
const { testMsgsUsers } = require('./user/msgs_users');
const { testMsgsUserUid } = require('./user/msgs_user_uid');
const { testUsersList } = require('./admin/users_list');
const { testUsersDisable } = require('./admin/users_disable');
const { testUsersInfoUid } = require('./admin/users_info_uid');
const { testUsersSettingsUid } = require('./admin/users_settings_uid');

async function runAllTests(verbosity = 1) {
  setVerbosity(verbosity);
  
  if (verbosity >= 1) {
    console.log('='.repeat(60));
    console.log('Running All API Tests');
    console.log(`Verbosity Level: ${verbosity}`);
    console.log('='.repeat(60));
    console.log('');
  }

  const results = {
    passed: 0,
    failed: 0,
    skipped: 0
  };

  // Open APIs (no authentication)
  if (verbosity >= 0) {
    console.log('\n--- Open APIs ---\n');
  }
  
  try {
    const status = await testStatus(verbosity);
    if (status) results.passed++; else results.failed++;
  } catch (e) {
    if (verbosity >= 1) {
      console.error('Status test error:', e.message);
    }
    results.failed++;
  }

  try {
    const register = await testRegister(verbosity);
    if (register) results.passed++; else results.failed++;
  } catch (e) {
    if (verbosity >= 1) {
      console.error('Register test error:', e.message);
    }
    results.failed++;
  }

  // Try to login and capture session token for subsequent tests
  let sessionToken = null;
  try {
    const { success, sessionToken: loginToken } = await testLogin(verbosity);
    if (success && loginToken) {
      results.passed++;
      sessionToken = loginToken;
      if (verbosity >= 1) {
        console.log(`\n✓ Login successful - using session token for secured tests\n`);
      }
    } else {
      results.failed++;
      if (verbosity >= 1) {
        console.log(`\n✗ Login failed - will skip secured tests\n`);
      }
    }
  } catch (e) {
    if (verbosity >= 1) {
      console.error('Login test error:', e.message);
    }
    results.failed++;
  }

  // If login failed, try to use existing session token from environment
  if (!sessionToken) {
    sessionToken = process.env.SESSION_TOKEN;
    if (sessionToken && verbosity >= 1) {
      console.log('Using SESSION_TOKEN from environment\n');
    }
  }

  try {
    const forgot = await testForgotPassword(verbosity);
    if (forgot) results.passed++; else results.failed++;
  } catch (e) {
    if (verbosity >= 1) {
      console.error('Forgot password test error:', e.message);
    }
    results.failed++;
  }

  // User APIs (require authentication)
  
  if (!sessionToken) {
    if (verbosity >= 1) {
      console.log('\n⚠️  Skipping user API tests - no session token available');
      console.log('   Run login test first or set SESSION_TOKEN environment variable\n');
    }
    results.skipped += 18; // Number of user API tests
  } else {
    if (verbosity >= 1) {
      console.log('\n--- User APIs ---\n');
    }
    
    // Note: We skip logout test here since it would invalidate the session token
    // and prevent other tests from running. Logout test should be run separately
    // or at the end if needed.

    try {
      const info = await testUserInfo(sessionToken, verbosity);
      if (info) results.passed++; else results.failed++;
    } catch (e) {
      if (verbosity >= 1) {
        console.error('User info test error:', e.message);
      }
      results.failed++;
    }

    try {
      const settings = await testUserSettings(sessionToken, verbosity);
      if (settings) results.passed++; else results.failed++;
    } catch (e) {
      if (verbosity >= 1) {
        console.error('User settings test error:', e.message);
      }
      results.failed++;
    }

    try {
      const tiles = await testUserTiles(sessionToken, verbosity);
      if (tiles) results.passed++; else results.failed++;
    } catch (e) {
      if (verbosity >= 1) {
        console.error('User tiles test error:', e.message);
      }
      results.failed++;
    }

    let readingKey = null;
    try {
      const { success, readingKey: createdReadingKey } = await testReadingCreate(sessionToken, verbosity);
      if (success && createdReadingKey) {
        results.passed++;
        readingKey = createdReadingKey;
        process.env.READING_KEY = readingKey;
      } else {
        results.failed++;
      }
    } catch (e) {
      if (verbosity >= 1) {
        console.error('Reading create test error:', e.message);
      }
      results.failed++;
    }

    // Fallback to environment variable if creation failed
    if (!readingKey) {
      readingKey = process.env.READING_KEY;
    }

    if (readingKey) {
      try {
        const edit = await testReadingEdit(sessionToken, readingKey, verbosity);
        if (edit) results.passed++; else results.failed++;
      } catch (e) {
        if (verbosity >= 1) {
          console.error('Reading edit test error:', e.message);
        }
        results.failed++;
      }

      try {
        const read = await testReadingRead(sessionToken, readingKey, verbosity);
        if (read) results.passed++; else results.failed++;
      } catch (e) {
        if (verbosity >= 1) {
          console.error('Reading read test error:', e.message);
        }
        results.failed++;
      }

      try {
        const impressions = await testReadingImpressions(sessionToken, readingKey, verbosity);
        if (impressions) results.passed++; else results.failed++;
      } catch (e) {
        if (verbosity >= 1) {
          console.error('Reading impressions test error:', e.message);
        }
        results.failed++;
      }
    } else {
      results.skipped += 3;
    }

    try {
      const list = await testReadingList(sessionToken, verbosity);
      if (list) results.passed++; else results.failed++;
    } catch (e) {
      if (verbosity >= 1) {
        console.error('Reading list test error:', e.message);
      }
      results.failed++;
    }

    try {
      const stats = await testReadingStats(sessionToken, verbosity);
      if (stats) results.passed++; else results.failed++;
    } catch (e) {
      if (verbosity >= 1) {
        console.error('Reading stats test error:', e.message);
      }
      results.failed++;
    }

    try {
      const statsCards = await testReadingStatsCards(sessionToken, verbosity);
      if (statsCards) results.passed++; else results.failed++;
    } catch (e) {
      if (verbosity >= 1) {
        console.error('Reading stats cards test error:', e.message);
      }
      results.failed++;
    }

    try {
      const msgsList = await testMsgsList(sessionToken, verbosity);
      if (msgsList) results.passed++; else results.failed++;
    } catch (e) {
      if (verbosity >= 1) {
        console.error('Messages list test error:', e.message);
      }
      results.failed++;
    }

    try {
      const msgsUsers = await testMsgsUsers(sessionToken, verbosity);
      if (msgsUsers) results.passed++; else results.failed++;
    } catch (e) {
      if (verbosity >= 1) {
        console.error('Messages users test error:', e.message);
      }
      results.failed++;
    }

    try {
      const msgsUserUid = await testMsgsUserUid(sessionToken, null, verbosity);
      if (msgsUserUid) results.passed++; else results.failed++;
    } catch (e) {
      if (verbosity >= 1) {
        console.error('Messages user UID test error:', e.message);
      }
      results.failed++;
    }

    try {
      const readingAnalyzeImage = await testReadingAnalyzeImage(sessionToken, verbosity);
      if (readingAnalyzeImage) results.passed++; else results.failed++;
    } catch (e) {
      if (verbosity >= 1) {
        console.error('Reading analyze image test error:', e.message);
      }
      results.failed++;
    }

    // Reading share test requires a reading key
    if (readingKey) {
      try {
        const readingShare = await testReadingShare(sessionToken, readingKey, verbosity);
        if (readingShare) results.passed++; else results.failed++;
      } catch (e) {
        if (verbosity >= 1) {
          console.error('Reading share test error:', e.message);
        }
        results.failed++;
      }
    } else {
      results.skipped++;
    }

    // Run logout test at the end since it invalidates the session
    try {
      const logout = await testLogout(sessionToken, verbosity);
      if (logout) results.passed++; else results.failed++;
    } catch (e) {
      if (verbosity >= 1) {
        console.error('Logout test error:', e.message);
      }
      results.failed++;
    }
  }

  // Admin APIs (require admin role)
  // Try to login as admin if credentials are provided
  let adminSessionToken = process.env.ADMIN_SESSION_TOKEN;
  
  if (!adminSessionToken && process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
    if (verbosity >= 1) {
      console.log('\nAttempting admin login...\n');
    }
    try {
      // Create a temporary login test with admin credentials
      const { apiRequest } = require('./helpers');
      const adminLoginResult = await apiRequest('POST', '/users/login', {
        body: {
          username: process.env.ADMIN_USERNAME,
          password: process.env.ADMIN_PASSWORD
        },
        verbosity
      });
      
      if (adminLoginResult.ok && adminLoginResult.data && adminLoginResult.data.session_key) {
        adminSessionToken = adminLoginResult.data.session_key;
        if (verbosity >= 1) {
          console.log('✓ Admin login successful\n');
        }
      } else {
        if (verbosity >= 1) {
          console.log('✗ Admin login failed\n');
        }
      }
    } catch (e) {
      if (verbosity >= 1) {
        console.error('Admin login error:', e.message);
      }
    }
  }
  
  if (!adminSessionToken) {
    if (verbosity >= 1) {
      console.log('\n⚠️  Skipping admin API tests - no admin session token available');
      console.log('   Set ADMIN_SESSION_TOKEN environment variable');
      console.log('   Or set ADMIN_USERNAME and ADMIN_PASSWORD to auto-login\n');
    }
    results.skipped += 4;
  } else {
    if (verbosity >= 1) {
      console.log('\n--- Admin APIs ---\n');
    }
    
    try {
      const usersList = await testUsersList(adminSessionToken, verbosity);
      if (usersList) results.passed++; else results.failed++;
    } catch (e) {
      if (verbosity >= 1) {
        console.error('Users list test error:', e.message);
      }
      results.failed++;
    }

    try {
      const targetUserId = process.env.TARGET_USER_ID || '2';
      const usersDisable = await testUsersDisable(adminSessionToken, targetUserId, verbosity);
      if (usersDisable) results.passed++; else results.failed++;
    } catch (e) {
      if (verbosity >= 1) {
        console.error('Users disable test error:', e.message);
      }
      results.failed++;
    }

    try {
      const targetUserId = process.env.TARGET_USER_ID || '2';
      const usersInfoUid = await testUsersInfoUid(adminSessionToken, targetUserId, verbosity);
      if (usersInfoUid) results.passed++; else results.failed++;
    } catch (e) {
      if (verbosity >= 1) {
        console.error('Users info UID test error:', e.message);
      }
      results.failed++;
    }

    try {
      const targetUserId = process.env.TARGET_USER_ID || '2';
      const usersSettingsUid = await testUsersSettingsUid(adminSessionToken, targetUserId, verbosity);
      if (usersSettingsUid) results.passed++; else results.failed++;
    } catch (e) {
      if (verbosity >= 1) {
        console.error('Users settings UID test error:', e.message);
      }
      results.failed++;
    }
  }

  // Summary
  if (verbosity >= 1) {
    console.log('\n' + '='.repeat(60));
    console.log('Test Summary');
    console.log('='.repeat(60));
    console.log(`Passed:  ${results.passed}`);
    console.log(`Failed:  ${results.failed}`);
    console.log(`Skipped: ${results.skipped}`);
    console.log(`Total:   ${results.passed + results.failed + results.skipped}`);
    console.log('='.repeat(60));
    console.log('');
  } else {
    // Level 0: Just show summary
    console.log(`Passed: ${results.passed}, Failed: ${results.failed}, Skipped: ${results.skipped}`);
  }

  process.exit(results.failed > 0 ? 1 : 0);
}

// Run if executed directly
if (require.main === module) {
  // Parse verbosity from command line: node run_all.js [verbosity]
  const verbosity = process.argv[2] !== undefined ? parseInt(process.argv[2], 10) : 
                    (process.env.VERBOSITY ? parseInt(process.env.VERBOSITY, 10) : 1);
  
  runAllTests(verbosity).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests };


