const pool = require('./database');

/**
 * Creates all database tables as defined in the schema
 */
async function createTables() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS Users (
        users_key SERIAL PRIMARY KEY,
        users_id VARCHAR(255) UNIQUE NOT NULL,
        users_email VARCHAR(255),
        users_name VARCHAR(255),
        users_role VARCHAR(50) DEFAULT 'user',
        users_password VARCHAR(255) NOT NULL,
        users_state VARCHAR(50) DEFAULT 'Pending' CHECK (users_state IN ('Active', 'Pending', 'Disabled'))
      )
    `);

    // UsersSessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS UsersSessions (
        session_key VARCHAR(255) PRIMARY KEY,
        users_key INTEGER NOT NULL REFERENCES Users(users_key) ON DELETE CASCADE,
        session_time_start TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        session_last_activity TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        session_location VARCHAR(255)
      )
    `);

    // Cards table
    await client.query(`
      CREATE TABLE IF NOT EXISTS Cards (
        cards_key SERIAL PRIMARY KEY,
        cards_suite VARCHAR(50),
        cards_number INTEGER,
        cards_name VARCHAR(50),
        cards_description TEXT
      )
    `);

    // Readings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS Readings (
        readings_key SERIAL PRIMARY KEY,
        users_key INTEGER NOT NULL REFERENCES Users(users_key) ON DELETE CASCADE,
        spread_key INTEGER,
        readings_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ReadingCards table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ReadingCards (
        readcard_key SERIAL PRIMARY KEY,
        readings_key INTEGER NOT NULL REFERENCES Readings(readings_key) ON DELETE CASCADE,
        cards_key INTEGER NOT NULL REFERENCES Cards(cards_key) ON DELETE CASCADE,
        spread_position INTEGER
      )
    `);

    // Notes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS Notes (
        notes_key SERIAL PRIMARY KEY,
        readings_key INTEGER NOT NULL REFERENCES Readings(readings_key) ON DELETE CASCADE,
        users_key INTEGER NOT NULL REFERENCES Users(users_key) ON DELETE CASCADE,
        notes_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        notes_text TEXT
      )
    `);

    // ImpressionTags table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ImpressionTags (
        impr_key SERIAL PRIMARY KEY,
        impr_tag VARCHAR(255) NOT NULL
      )
    `);

    // Impressions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS Impressions (
        impr_key SERIAL PRIMARY KEY,
        readings_key INTEGER NOT NULL REFERENCES Readings(readings_key) ON DELETE CASCADE,
        users_key INTEGER NOT NULL REFERENCES Users(users_key) ON DELETE CASCADE,
        impr_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        imprtag_key INTEGER REFERENCES ImpressionTags(impr_key) ON DELETE SET NULL
      )
    `);

    // ReadingsShare table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ReadingsShare (
        readshare_key SERIAL PRIMARY KEY,
        readings_key INTEGER NOT NULL REFERENCES Readings(readings_key) ON DELETE CASCADE,
        users_key INTEGER NOT NULL REFERENCES Users(users_key) ON DELETE CASCADE,
        users_shared_key INTEGER NOT NULL REFERENCES Users(users_key) ON DELETE CASCADE
      )
    `);

    // CardMeanings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS CardMeanings (
        meaning_key SERIAL PRIMARY KEY,
        cards_key INTEGER NOT NULL REFERENCES Cards(cards_key) ON DELETE CASCADE,
        users_key INTEGER NOT NULL REFERENCES Users(users_key) ON DELETE CASCADE,
        meaning_text TEXT
      )
    `);

    // CardTags table
    await client.query(`
      CREATE TABLE IF NOT EXISTS CardTags (
        cardtags_key SERIAL PRIMARY KEY,
        cardtags_tag VARCHAR(255) NOT NULL
      )
    `);

    // CardTagLink table
    await client.query(`
      CREATE TABLE IF NOT EXISTS CardTagLink (
        cards_key INTEGER NOT NULL REFERENCES Cards(cards_key) ON DELETE CASCADE,
        users_key INTEGER NOT NULL REFERENCES Users(users_key) ON DELETE CASCADE,
        cardtags_key INTEGER NOT NULL REFERENCES CardTags(cardtags_key) ON DELETE CASCADE,
        PRIMARY KEY (cards_key, users_key, cardtags_key)
      )
    `);

    // CardSkins table
    await client.query(`
      CREATE TABLE IF NOT EXISTS CardSkins (
        cardskin_key SERIAL PRIMARY KEY,
        cards_key INTEGER NOT NULL REFERENCES Cards(cards_key) ON DELETE CASCADE,
        cards_image_key VARCHAR(255)
      )
    `);

    // UserTiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS UserTiles (
        tiles_key SERIAL PRIMARY KEY,
        users_key INTEGER NOT NULL UNIQUE REFERENCES Users(users_key) ON DELETE CASCADE,
        tiles_config JSONB
      )
    `);

    // Messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS Messages (
        msg_key SERIAL PRIMARY KEY,
        users_key_src INTEGER NOT NULL REFERENCES Users(users_key) ON DELETE CASCADE,
        users_key_dest INTEGER NOT NULL REFERENCES Users(users_key) ON DELETE CASCADE,
        readings_key INTEGER REFERENCES Readings(readings_key) ON DELETE SET NULL,
        msg_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        msg_read BOOLEAN DEFAULT FALSE,
        msg_text TEXT
      )
    `);

    // Create indexes for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_readings_users_key ON Readings(users_key)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_readings_time ON Readings(readings_time)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_readingcards_readings_key ON ReadingCards(readings_key)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_usersessions_users_key ON UsersSessions(users_key)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_usersessions_last_activity ON UsersSessions(session_last_activity)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_impressions_readings_key ON Impressions(readings_key)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_notes_readings_key ON Notes(readings_key)
    `);

    await client.query('COMMIT');
    console.log('All tables created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Clears all data from tables (truncate)
 */
async function clearTables() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Delete in order to respect foreign key constraints
    await client.query('TRUNCATE TABLE Messages CASCADE');
    await client.query('TRUNCATE TABLE UserTiles CASCADE');
    await client.query('TRUNCATE TABLE CardSkins CASCADE');
    await client.query('TRUNCATE TABLE CardTagLink CASCADE');
    await client.query('TRUNCATE TABLE CardTags CASCADE');
    await client.query('TRUNCATE TABLE CardMeanings CASCADE');
    await client.query('TRUNCATE TABLE ReadingsShare CASCADE');
    await client.query('TRUNCATE TABLE Impressions CASCADE');
    await client.query('TRUNCATE TABLE ImpressionTags CASCADE');
    await client.query('TRUNCATE TABLE Notes CASCADE');
    await client.query('TRUNCATE TABLE ReadingCards CASCADE');
    await client.query('TRUNCATE TABLE Readings CASCADE');
    await client.query('TRUNCATE TABLE UsersSessions CASCADE');
    await client.query('TRUNCATE TABLE Cards CASCADE');
    await client.query('TRUNCATE TABLE Users CASCADE');

    await client.query('COMMIT');
    console.log('All tables cleared successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Drops all database tables
 */
async function deleteTables() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Drop in order to respect foreign key constraints
    await client.query('DROP TABLE IF EXISTS Messages CASCADE');
    await client.query('DROP TABLE IF EXISTS UserTiles CASCADE');
    await client.query('DROP TABLE IF EXISTS CardSkins CASCADE');
    await client.query('DROP TABLE IF EXISTS CardTagLink CASCADE');
    await client.query('DROP TABLE IF EXISTS CardTags CASCADE');
    await client.query('DROP TABLE IF EXISTS CardMeanings CASCADE');
    await client.query('DROP TABLE IF EXISTS ReadingsShare CASCADE');
    await client.query('DROP TABLE IF EXISTS Impressions CASCADE');
    await client.query('DROP TABLE IF EXISTS ImpressionTags CASCADE');
    await client.query('DROP TABLE IF EXISTS Notes CASCADE');
    await client.query('DROP TABLE IF EXISTS ReadingCards CASCADE');
    await client.query('DROP TABLE IF EXISTS Readings CASCADE');
    await client.query('DROP TABLE IF EXISTS UsersSessions CASCADE');
    await client.query('DROP TABLE IF EXISTS Cards CASCADE');
    await client.query('DROP TABLE IF EXISTS Users CASCADE');

    await client.query('COMMIT');
    console.log('All tables deleted successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  createTables,
  clearTables,
  deleteTables
};

