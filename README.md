# Tarot Manager - Phase 1

Backend web server for the Tarot Manager application. This Phase 1 implementation includes the NodeJS backend server with REST APIs, PostgreSQL database setup, and testing utilities.

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 15 or higher
- Docker and Docker Compose (optional, for containerized setup)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update the database connection settings:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials.

### 3. Database Setup

#### Option A: Using Docker Compose (Recommended)

```bash
docker-compose up -d postgres
```

Wait for the database to be ready, then:

```bash
npm run create-tables
```

#### Option B: Using Local PostgreSQL

Ensure PostgreSQL is running and create the database:

```sql
CREATE DATABASE tarot_manager;
```

Then run:

```bash
npm run create-tables
```

### 4. Create Initial User

```bash
npm run create-user <user_id> <email> <password> [name] [role] [state]
```

Example:
```bash
npm run create-user admin admin@example.com password123 "Admin User" admin Active
```

### 5. Start Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Available Scripts

- `npm start` - Start the server
- `npm run dev` - Start server with nodemon (auto-reload)
- `npm run create-tables` - Create all database tables
- `npm run clear-tables` - Clear all data from tables (truncate)
- `npm run delete-tables` - Drop all database tables
- `npm run create-user` - Create a new user
- `npm run execute-sql` - Execute SQL from file or query

## API Endpoints

### Open APIs (No Authentication)

- `POST /users/login` - User login
- `GET /status` - Server status

### User APIs (Require Session Token)

- `POST /users/logout` - Logout
- `GET /users/info` - Get user information
- `GET /users/settings` - Get user settings
- `POST /users/settings` - Update user settings
- `POST /reading/create` - Create a new reading
- `POST /reading/edit` - Edit a reading
- `POST /reading/delete` - Delete a reading
- `GET /reading/list` - List readings
- `GET /reading/read?key=<key>` - Get reading (key can be 'last' or readings_key)
- `GET /reading/impressions?key=<readings_key>` - Get impressions for a reading
- `POST /reading/impressions` - Create impression for a reading

### Admin APIs (Require Admin Role + Session Token)

- `GET /users/list` - List all users

## Authentication

All user and admin APIs require a session token. Include it in the request:

- Header: `x-session-token: <session_key>`
- Query parameter: `?session_token=<session_key>`
- Body: `{ "session_token": "<session_key>" }`

## Docker Setup

To run everything with Docker:

```bash
docker-compose up
```

This will start both PostgreSQL and the backend server.

## Database Management

### Clear All Data

```bash
npm run clear-tables
```

### Delete All Tables

```bash
npm run delete-tables
```

### Execute Custom SQL

```bash
npm run execute-sql -- --query "SELECT * FROM Users"
```

Or from a file:

```bash
npm run execute-sql path/to/query.sql
```

## Project Structure

```
.
├── server/
│   ├── config/
│   │   ├── database.js      # Database connection
│   │   └── schema.js        # Table creation/management
│   ├── middleware/
│   │   └── auth.js          # Authentication middleware
│   ├── routes/
│   │   ├── users.js         # User management routes
│   │   ├── reading.js       # Reading management routes
│   │   └── status.js        # Status route
│   ├── utils/
│   │   ├── password.js      # Password hashing/validation
│   │   └── session.js      # Session management
│   └── index.js            # Main server file
├── tasks/
│   ├── create_tables.js    # Create database tables
│   ├── clear_tables.js     # Clear table data
│   ├── delete_tables.js    # Drop tables
│   ├── create_user.js      # Create user script
│   └── execute_sql.js       # Execute SQL script
├── docs/
│   ├── base.spec.md        # Project specification
│   └── phase-1-todo.md     # Phase 1 todo list
└── package.json

```

## Notes

- Session tokens expire after 24 hours of inactivity or 30 minutes of no activity
- Session cache refreshes every 5 minutes
- Password salt key is stored in `private/salt.key` (auto-generated if missing)
- All passwords are hashed with bcrypt using a salt key

