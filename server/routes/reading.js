const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { requireAuth } = require('../middleware/auth');

/**
 * POST /reading/create
 * User API - Requires authentication
 */
router.post('/create', requireAuth, async (req, res) => {
  try {
    const { spread_key, cards, impressions, tags } = req.body;

    if (!spread_key || !cards || !Array.isArray(cards)) {
      return res.status(400).json({
        success: false,
        error: 'spread_key and cards array are required'
      });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create reading
      const readingResult = await client.query(
        `INSERT INTO Readings (users_key, spread_key, readings_time)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         RETURNING readings_key, spread_key, readings_time`,
        [req.userKey, spread_key]
      );

      const readingsKey = readingResult.rows[0].readings_key;

      // Create ReadingCards entries
      for (const card of cards) {
        await client.query(
          `INSERT INTO ReadingCards (readings_key, cards_key, spread_position)
           VALUES ($1, $2, $3)`,
          [readingsKey, card.card_id, card.spread_position || null]
        );
      }

      // Create impressions if provided
      if (impressions && Array.isArray(impressions)) {
        for (const impressionText of impressions) {
          const imprResult = await client.query(
            `INSERT INTO Impressions (readings_key, users_key, impr_time)
             VALUES ($1, $2, CURRENT_TIMESTAMP)
             RETURNING impr_key`,
            [readingsKey, req.userKey]
          );

          // Create impression tags if provided
          if (tags && Array.isArray(tags)) {
            for (const tag of tags) {
              // Find or create impression tag
              let tagResult = await client.query(
                `SELECT impr_key FROM ImpressionTags WHERE impr_tag = $1 LIMIT 1`,
                [tag]
              );

              let imprtagKey;
              if (tagResult.rows.length === 0) {
                const newTagResult = await client.query(
                  `INSERT INTO ImpressionTags (impr_tag) VALUES ($1) RETURNING impr_key`,
                  [tag]
                );
                imprtagKey = newTagResult.rows[0].impr_key;
              } else {
                imprtagKey = tagResult.rows[0].impr_key;
              }

              // Link impression to tag
              await client.query(
                `UPDATE Impressions SET imprtag_key = $1 WHERE impr_key = $2`,
                [imprtagKey, imprResult.rows[0].impr_key]
              );
            }
          }
        }
      }

      await client.query('COMMIT');

      // Fetch complete reading data
      const readingData = await getReadingData(client, readingsKey, req.userKey);

      res.json({
        success: true,
        reading: readingData
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create reading error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create reading'
    });
  }
});

/**
 * POST /reading/edit
 * User API - Requires authentication
 */
router.post('/edit', requireAuth, async (req, res) => {
  try {
    const { readings_key, spread_key, cards, impressions, tags } = req.body;

    if (!readings_key) {
      return res.status(400).json({
        success: false,
        error: 'readings_key is required'
      });
    }

    const client = await pool.connect();
    try {
      // Verify reading belongs to user
      const verifyResult = await client.query(
        `SELECT users_key FROM Readings WHERE readings_key = $1`,
        [readings_key]
      );

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Reading not found'
        });
      }

      if (verifyResult.rows[0].users_key !== req.userKey) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized to edit this reading'
        });
      }

      await client.query('BEGIN');

      // Update reading
      if (spread_key !== undefined) {
        await client.query(
          `UPDATE Readings SET spread_key = $1 WHERE readings_key = $2`,
          [spread_key, readings_key]
        );
      }

      // Update cards if provided
      if (cards && Array.isArray(cards)) {
        // Delete existing cards
        await client.query(
          `DELETE FROM ReadingCards WHERE readings_key = $1`,
          [readings_key]
        );

        // Insert new cards
        for (const card of cards) {
          await client.query(
            `INSERT INTO ReadingCards (readings_key, cards_key, spread_position)
             VALUES ($1, $2, $3)`,
            [readings_key, card.card_id, card.spread_position || null]
          );
        }
      }

      // Update impressions if provided
      if (impressions !== undefined || tags !== undefined) {
        // For simplicity, we'll delete existing impressions and recreate
        // In a production system, you might want more sophisticated update logic
        if (impressions && Array.isArray(impressions)) {
          await client.query(
            `DELETE FROM Impressions WHERE readings_key = $1 AND users_key = $2`,
            [readings_key, req.userKey]
          );

          for (const impressionText of impressions) {
            const imprResult = await client.query(
              `INSERT INTO Impressions (readings_key, users_key, impr_time)
               VALUES ($1, $2, CURRENT_TIMESTAMP)
               RETURNING impr_key`,
              [readings_key, req.userKey]
            );

            if (tags && Array.isArray(tags)) {
              for (const tag of tags) {
                let tagResult = await client.query(
                  `SELECT impr_key FROM ImpressionTags WHERE impr_tag = $1 LIMIT 1`,
                  [tag]
                );

                let imprtagKey;
                if (tagResult.rows.length === 0) {
                  const newTagResult = await client.query(
                    `INSERT INTO ImpressionTags (impr_tag) VALUES ($1) RETURNING impr_key`,
                    [tag]
                  );
                  imprtagKey = newTagResult.rows[0].impr_key;
                } else {
                  imprtagKey = tagResult.rows[0].impr_key;
                }

                await client.query(
                  `UPDATE Impressions SET imprtag_key = $1 WHERE impr_key = $2`,
                  [imprtagKey, imprResult.rows[0].impr_key]
                );
              }
            }
          }
        }
      }

      await client.query('COMMIT');

      // Fetch updated reading data
      const readingData = await getReadingData(client, readings_key, req.userKey);

      res.json({
        success: true,
        reading: readingData
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Edit reading error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to edit reading'
    });
  }
});

/**
 * POST /reading/delete
 * User API - Requires authentication
 */
router.post('/delete', requireAuth, async (req, res) => {
  try {
    const { readings_key } = req.body;

    if (!readings_key) {
      return res.status(400).json({
        success: false,
        error: 'readings_key is required'
      });
    }

    const client = await pool.connect();
    try {
      // Verify reading belongs to user
      const verifyResult = await client.query(
        `SELECT users_key FROM Readings WHERE readings_key = $1`,
        [readings_key]
      );

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Reading not found'
        });
      }

      if (verifyResult.rows[0].users_key !== req.userKey) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized to delete this reading'
        });
      }

      // Delete reading (cascade will handle related records)
      await client.query(
        `DELETE FROM Readings WHERE readings_key = $1`,
        [readings_key]
      );

      res.json({
        success: true,
        message: 'Reading deleted successfully'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete reading error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete reading'
    });
  }
});

/**
 * GET /reading/list
 * User API - Requires authentication
 */
router.get('/list', requireAuth, async (req, res) => {
  try {
    const { count, sort = 'recent' } = req.query;
    const limit = count ? parseInt(count) : null;

    const client = await pool.connect();
    try {
      let query = `
        SELECT r.readings_key, r.spread_key, r.readings_time
        FROM Readings r
        WHERE r.users_key = $1
      `;

      const orderBy = sort === 'recent' ? 'ORDER BY r.readings_time DESC' : 'ORDER BY r.readings_key';
      query += ` ${orderBy}`;

      if (limit) {
        query += ` LIMIT $2`;
      }

      const result = await client.query(
        limit ? query : query.replace('LIMIT $2', ''),
        limit ? [req.userKey, limit] : [req.userKey]
      );

      // Get cards and tags for each reading
      const readings = [];
      for (const row of result.rows) {
        const reading = {
          readings_key: row.readings_key,
          spread_key: row.spread_key,
          readings_time: row.readings_time
        };

        // Get cards
        const cardsResult = await client.query(
          `SELECT rc.cards_key, rc.spread_position, c.cards_suite, c.cards_number
           FROM ReadingCards rc
           JOIN Cards c ON rc.cards_key = c.cards_key
           WHERE rc.readings_key = $1
           ORDER BY rc.spread_position, rc.readcard_key
           LIMIT 5`,
          [row.readings_key]
        );
        reading.cards = cardsResult.rows;

        // Get tags
        const tagsResult = await client.query(
          `SELECT DISTINCT it.impr_tag
           FROM Impressions i
           JOIN ImpressionTags it ON i.imprtag_key = it.impr_key
           WHERE i.readings_key = $1
           LIMIT 2`,
          [row.readings_key]
        );
        reading.tags = tagsResult.rows.map(r => r.impr_tag);

        readings.push(reading);
      }

      res.json({
        success: true,
        readings: readings
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('List readings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list readings'
    });
  }
});

/**
 * GET /reading/read
 * User API - Requires authentication
 */
router.get('/read', requireAuth, async (req, res) => {
  try {
    const { key } = req.query;

    if (!key) {
      return res.status(400).json({
        success: false,
        error: 'key parameter is required'
      });
    }

    const client = await pool.connect();
    try {
      let readingsKey;

      if (key === 'last') {
        // Get most recent reading
        const result = await client.query(
          `SELECT readings_key FROM Readings
           WHERE users_key = $1
           ORDER BY readings_time DESC
           LIMIT 1`,
          [req.userKey]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'No readings found'
          });
        }

        readingsKey = result.rows[0].readings_key;
      } else {
        readingsKey = parseInt(key);
      }

      // Verify reading belongs to user
      const verifyResult = await client.query(
        `SELECT users_key FROM Readings WHERE readings_key = $1`,
        [readingsKey]
      );

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Reading not found'
        });
      }

      if (verifyResult.rows[0].users_key !== req.userKey) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized to access this reading'
        });
      }

      // Get complete reading data
      const readingData = await getReadingData(client, readingsKey, req.userKey);

      res.json({
        success: true,
        reading: readingData
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Read reading error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve reading'
    });
  }
});

/**
 * GET /reading/impressions
 * POST /reading/impressions
 * User API - Requires authentication
 */
router.get('/impressions', requireAuth, async (req, res) => {
  try {
    const { key } = req.query;

    if (!key) {
      return res.status(400).json({
        success: false,
        error: 'key parameter is required'
      });
    }

    const readingsKey = parseInt(key);

    const client = await pool.connect();
    try {
      // Verify reading belongs to user
      const verifyResult = await client.query(
        `SELECT users_key FROM Readings WHERE readings_key = $1`,
        [readingsKey]
      );

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Reading not found'
        });
      }

      if (verifyResult.rows[0].users_key !== req.userKey) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized to access this reading'
        });
      }

      // Get impressions
      const result = await client.query(
        `SELECT i.impr_key, i.readings_key, i.users_key, i.impr_time, it.impr_tag, u.users_name
         FROM Impressions i
         LEFT JOIN ImpressionTags it ON i.imprtag_key = it.impr_key
         LEFT JOIN Users u ON i.users_key = u.users_key
         WHERE i.readings_key = $1
         ORDER BY i.impr_time DESC`,
        [readingsKey]
      );

      res.json({
        success: true,
        impressions: result.rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get impressions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve impressions'
    });
  }
});

router.post('/impressions', requireAuth, async (req, res) => {
  try {
    const { key, tags } = req.body;

    if (!key) {
      return res.status(400).json({
        success: false,
        error: 'key parameter is required'
      });
    }

    const readingsKey = parseInt(key);

    const client = await pool.connect();
    try {
      // Verify reading belongs to user
      const verifyResult = await client.query(
        `SELECT users_key FROM Readings WHERE readings_key = $1`,
        [readingsKey]
      );

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Reading not found'
        });
      }

      if (verifyResult.rows[0].users_key !== req.userKey) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized to add impressions to this reading'
        });
      }

      await client.query('BEGIN');

      // Create impression
      const imprResult = await client.query(
        `INSERT INTO Impressions (readings_key, users_key, impr_time)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         RETURNING impr_key`,
        [readingsKey, req.userKey]
      );

      const imprKey = imprResult.rows[0].impr_key;

      // Handle tags if provided
      if (tags && Array.isArray(tags)) {
        for (const tag of tags) {
          // Find or create impression tag
          let tagResult = await client.query(
            `SELECT impr_key FROM ImpressionTags WHERE impr_tag = $1 LIMIT 1`,
            [tag]
          );

          let imprtagKey;
          if (tagResult.rows.length === 0) {
            const newTagResult = await client.query(
              `INSERT INTO ImpressionTags (impr_tag) VALUES ($1) RETURNING impr_key`,
              [tag]
            );
            imprtagKey = newTagResult.rows[0].impr_key;
          } else {
            imprtagKey = tagResult.rows[0].impr_key;
          }

          // Link impression to tag
          await client.query(
            `UPDATE Impressions SET imprtag_key = $1 WHERE impr_key = $2`,
            [imprtagKey, imprKey]
          );
        }
      }

      await client.query('COMMIT');

      // Get created impression
      const result = await client.query(
        `SELECT i.impr_key, i.readings_key, i.users_key, i.impr_time, it.impr_tag, u.users_name
         FROM Impressions i
         LEFT JOIN ImpressionTags it ON i.imprtag_key = it.impr_key
         LEFT JOIN Users u ON i.users_key = u.users_key
         WHERE i.impr_key = $1`,
        [imprKey]
      );

      res.json({
        success: true,
        impression: result.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create impression error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create impression'
    });
  }
});

/**
 * Helper function to get complete reading data
 */
async function getReadingData(client, readingsKey, userKey) {
  // Get reading
  const readingResult = await client.query(
    `SELECT readings_key, users_key, spread_key, readings_time
     FROM Readings
     WHERE readings_key = $1`,
    [readingsKey]
  );

  if (readingResult.rows.length === 0) {
    return null;
  }

  const reading = readingResult.rows[0];

  // Get cards
  const cardsResult = await client.query(
    `SELECT rc.readcard_key, rc.cards_key, rc.spread_position, c.cards_suite, c.cards_number
     FROM ReadingCards rc
     JOIN Cards c ON rc.cards_key = c.cards_key
     WHERE rc.readings_key = $1
     ORDER BY rc.spread_position, rc.readcard_key`,
    [readingsKey]
  );
  reading.cards = cardsResult.rows;

  // Get notes
  const notesResult = await client.query(
    `SELECT notes_key, notes_time, notes_text
     FROM Notes
     WHERE readings_key = $1
     ORDER BY notes_time DESC`,
    [readingsKey]
  );
  reading.notes = notesResult.rows;

  // Get impressions and tags
  const impressionsResult = await client.query(
    `SELECT i.impr_key, i.users_key, i.impr_time, it.impr_tag, u.users_name
     FROM Impressions i
     LEFT JOIN ImpressionTags it ON i.imprtag_key = it.impr_key
     LEFT JOIN Users u ON i.users_key = u.users_key
     WHERE i.readings_key = $1
     ORDER BY i.impr_time DESC`,
    [readingsKey]
  );
  reading.impressions = impressionsResult.rows;

  return reading;
}

module.exports = router;

