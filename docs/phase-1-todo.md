# Phase 1 - Todo List

This document outlines all APIs, features, and tasks that need to be implemented for Phase 1 of the Tarot Manager application.

## Overview
Phase 1 focuses on building the backend infrastructure: a NodeJS web server with REST APIs, PostgreSQL database setup, and testing utilities. No frontend UI is included in this phase.

## 1. Database Setup

### 1.1 PostgreSQL Database Server
- [ ] Set up PostgreSQL database server (Docker container or local)
- [ ] Configure database connection settings
- [ ] Create initial database schema

### 1.2 Database Tables
Create all tables as defined in the schema:

- [ ] **Readings** table
  - readings_key (primary key)
  - users_key (foreign key to Users)
  - spread_key
  - readings_time

- [ ] **ReadingsShare** table
  - readshare_key (primary key)
  - readings_key (foreign key to Readings)
  - users_key (foreign key to Users)
  - users_shared_key (foreign key to Users)

- [ ] **ReadingCards** table
  - readcard_key (primary key)
  - readings_key (foreign key to Readings)
  - cards_key (foreign key to Cards)

- [ ] **Notes** table
  - notes_key (primary key)
  - readings_key (foreign key to Readings)
  - users_key (foreign key to Users)
  - notes_time
  - notes_text

- [ ] **Impressions** table
  - impr_key (primary key)
  - readings_key (foreign key to Readings)
  - users_key (foreign key to Users)
  - impr_time
  - imprtag_key (foreign key to ImpressionTags)

- [ ] **ImpressionTags** table
  - impr_key (primary key)
  - impr_tag

- [ ] **Cards** table
  - cards_key (primary key)
  - cards_suite
  - cards_number

- [ ] **CardMeanings** table
  - meaning_key (primary key)
  - cards_key (foreign key to Cards)
  - users_key (foreign key to Users)
  - meaning_text

- [ ] **CardTags** table
  - cardtags_key (primary key)
  - cardtags_tag

- [ ] **CardTagLink** table
  - cards_key (foreign key to Cards)
  - users_key (foreign key to Users)
  - cardtags_key (foreign key to CardTags)
  - (composite primary key)

- [ ] **CardSkins** table
  - cardskin_key (primary key)
  - cards_key (foreign key to Cards)
  - cards_image_key

- [ ] **Users** table
  - users_key (primary key)
  - users_id (unique)
  - users_email
  - users_name
  - users_role
  - users_password (encrypted)
  - users_state (Active, Pending, Disabled)

- [ ] **UsersSessions** table
  - session_key (primary key)
  - users_key (foreign key to Users)
  - session_time_start
  - session_last_activity
  - session_location (IP+clientid)

- [ ] **UserTiles** table
  - tiles_key (primary key)
  - users_key (foreign key to Users)
  - tiles_config (JSON)

- [ ] **Messages** table
  - msg_key (primary key)
  - users_key_src (foreign key to Users)
  - users_key_dest (foreign key to Users)
  - readings_key (foreign key to Readings, nullable)
  - msg_time
  - msg_read (boolean)
  - msg_text

### 1.3 Database Initialization Scripts
Create sample JavaScript scripts for database management:

- [ ] **create_tables.js** - Script to create all database tables
- [ ] **clear_tables.js** - Script to clear all data from tables (truncate)
- [ ] **delete_tables.js** - Script to drop all database tables
- [ ] **create_user.js** - Script to create a new user in the database
- [ ] **execute_sql.js** - Generic script to execute arbitrary SQL statements

## 2. Backend Web Server

### 2.1 Server Infrastructure
- [ ] Set up NodeJS backend web server
- [ ] Configure Express.js or similar framework
- [ ] Set up Docker container configuration for backend
- [ ] Configure environment variables and settings
- [ ] Set up error handling middleware
- [ ] Set up request logging

### 2.2 User Management System

#### 2.2.1 Password Security
- [ ] Implement password hashing with salt
- [ ] Create/configure key file in webserver private directory for salt
- [ ] Implement password encryption before database comparison
- [ ] Implement password validation for strength requirements

#### 2.2.2 Session Management
- [ ] Implement session creation on login
- [ ] Implement session lookup by session_key
- [ ] Implement in-memory session cache
- [ ] Implement session cache refresh mechanism (every 5 minutes)
- [ ] Implement automatic session cleanup for expired sessions
- [ ] Implement session timeout validation:
  - Check max_session_duration (interval since session start)
  - Check min_session_activity_duration (interval since last activity)
- [ ] Implement session location tracking (IP+clientid)
- [ ] Implement removal of existing sessions for same user+location on login
- [ ] Implement session deletion on logout

#### 2.2.3 Authentication Middleware
- [ ] Create middleware to validate session token for user APIs
- [ ] Return session timeout message when session is invalid/expired
- [ ] Update session last_activity on each API call

### 2.3 Open Web APIs (No Authentication Required)

#### 2.3.1 `/users/login`
- [ ] Accept username/id and password
- [ ] Validate credentials against database
- [ ] Create user session on successful login
- [ ] Return session_key on success
- [ ] Return error on invalid credentials
- [ ] Remove existing sessions for same user+location

#### 2.3.2 `/status`
- [ ] Return server status information
- [ ] Return application version
- [ ] Return database connection status

### 2.4 User Web APIs (Require Session Token)

#### 2.4.1 `/users/logout`
- [ ] Validate session token
- [ ] Remove session from database
- [ ] Remove session from cache
- [ ] Return success/error response

#### 2.4.2 `/users/info`
- [ ] Validate session token
- [ ] Retrieve user information for logged-in user
- [ ] Return user data (excluding password)
- [ ] Handle errors appropriately

#### 2.4.3 `/users/settings`
- [ ] Validate session token
- [ ] GET: Retrieve user settings
- [ ] POST/PUT: Update user settings
- [ ] Validate and sanitize input
- [ ] Return updated settings or error

#### 2.4.4 `/reading/create`
- [ ] Validate session token
- [ ] Accept reading data (spread_key, cards, etc.)
- [ ] Create new reading record in Readings table
- [ ] Create ReadingCards entries for each card
- [ ] Associate reading with logged-in user
- [ ] Set readings_time to current timestamp
- [ ] Return created reading data with readings_key

#### 2.4.5 `/reading/edit`
- [ ] Validate session token
- [ ] Accept readings_key and updated reading data
- [ ] Verify reading belongs to logged-in user
- [ ] Update reading record
- [ ] Update ReadingCards entries if cards changed
- [ ] Return updated reading data or error

#### 2.4.6 `/reading/delete`
- [ ] Validate session token
- [ ] Accept readings_key
- [ ] Verify reading belongs to logged-in user
- [ ] Delete associated ReadingCards entries
- [ ] Delete associated Notes entries
- [ ] Delete associated Impressions entries
- [ ] Delete reading record
- [ ] Return success/error response

#### 2.4.7 `/reading/list`
- [ ] Validate session token
- [ ] Retrieve all readings for logged-in user
- [ ] Support optional query parameters:
  - count (limit number of results)
  - sort (e.g., 'recent')
- [ ] Return list of readings with basic info
- [ ] Include associated cards (limit to first N if specified)
- [ ] Include tags if available

#### 2.4.8 `/reading/read`
- [ ] Validate session token
- [ ] Accept URL parameter: `key` (string or 'last')
- [ ] If key is 'last', retrieve most recent reading for user
- [ ] If key is readings_key, retrieve specific reading
- [ ] Verify reading belongs to logged-in user
- [ ] Return full reading data including:
  - Reading details (date, spread)
  - Associated cards
  - Associated notes
  - Associated impressions and tags
- [ ] Return error if reading not found or unauthorized

#### 2.4.9 `/reading/impressions`
- [ ] Validate session token
- [ ] Accept URL parameter: `key` (readings_key)
- [ ] Verify reading belongs to logged-in user
- [ ] GET: Retrieve all impressions for the reading
- [ ] POST: Create new impression for the reading
- [ ] Handle impression tags (ImpressionTags table)
- [ ] Return impressions list or created impression

### 2.5 Admin Web APIs (Require Admin Role + Session Token)

#### 2.5.1 `/users/list`
- [ ] Validate session token
- [ ] Verify user has admin role
- [ ] Retrieve list of all users
- [ ] Support pagination if needed
- [ ] Return user list (excluding passwords)
- [ ] Return error if not admin

## 3. API Testing Scripts

Create sample JavaScript scripts to test the APIs:

- [ ] **test_create_reading.js**
  - Test creating a new reading via `/reading/create`
  - Include sample data for spread and cards
  - Display created reading_key

- [ ] **test_list_readings.js**
  - Test listing readings via `/reading/list`
  - Test with different query parameters (count, sort)
  - Display results

- [ ] **test_get_reading.js**
  - Test retrieving a reading via `/reading/read`
  - Test with specific key
  - Test with 'last' key
  - Display full reading data

- [ ] **test_delete_reading.js**
  - Test deleting a reading via `/reading/delete`
  - Verify deletion was successful
  - Handle errors appropriately

## 4. Documentation

- [ ] Document API endpoints with:
  - Request methods (GET, POST, PUT, DELETE)
  - Request parameters (URL params, query params, body)
  - Response formats (success and error)
  - Authentication requirements
  - Example requests and responses
  - Document each api endpoint in its own file

- [ ] Create top level api endpoint document, with links to individual endpoints

- [ ] Document database schema:
  - Table relationships
  - Foreign key constraints
  - Indexes needed for performance

- [ ] Document session management:
  - Session timeout values
  - Cache refresh intervals
  - Session validation logic

- [ ] Document setup instructions:
  - Database initialization
  - Server configuration
  - Environment variables
  - Docker setup

## 5. Error Handling

- [ ] Implement consistent error response format
- [ ] Handle database connection errors
- [ ] Handle invalid session tokens
- [ ] Handle expired sessions
- [ ] Handle unauthorized access attempts
- [ ] Handle invalid input validation
- [ ] Handle missing resources (404)
- [ ] Log errors appropriately

## 6. Security Considerations

- [ ] Ensure passwords are never returned in API responses
- [ ] Implement input validation and sanitization
- [ ] Implement SQL injection prevention
- [ ] Secure session key generation
- [ ] Implement rate limiting (optional but recommended)
- [ ] Secure key file storage for password salt

## 7. Testing

- [ ] Test all API endpoints with valid data
- [ ] Test all API endpoints with invalid data
- [ ] Test session expiration scenarios
- [ ] Test unauthorized access attempts
- [ ] Test admin-only endpoints with non-admin users
- [ ] Test database operations (create, read, update, delete)
- [ ] Test concurrent session handling

## Notes

- Phase 1 does NOT include any frontend UI components
- Phase 1 focuses solely on backend infrastructure and APIs
- All user APIs must validate session tokens
- Session management is critical for Phase 1 functionality
- Database scripts should be reusable and well-documented

