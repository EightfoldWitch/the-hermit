const pool = require('../server/config/database');
require('dotenv').config();

/**
 * Inserts all 78 tarot cards into the Cards table
 */
async function insertCards() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Major Arcana (22 cards, numbered 0-21)
    const majorArcana = [
      { number: 0, name: 'The Fool', description: 'New beginnings, innocence, spontaneity, a free spirit' },
      { number: 1, name: 'The Magician', description: 'Manifestation, resourcefulness, power, inspired action' },
      { number: 2, name: 'The High Priestess', description: 'Intuition, sacred knowledge, divine feminine, the subconscious mind' },
      { number: 3, name: 'The Empress', description: 'Femininity, beauty, nature, nurturing, abundance' },
      { number: 4, name: 'The Emperor', description: 'Authority, establishment, structure, a father figure' },
      { number: 5, name: 'The Hierophant', description: 'Spiritual wisdom, religious beliefs, conformity, tradition, conventionality' },
      { number: 6, name: 'The Lovers', description: 'Love, harmony, relationships, values alignment, choices' },
      { number: 7, name: 'The Chariot', description: 'Control, willpower, success, action, determination' },
      { number: 8, name: 'Strength', description: 'Strength, courage, persuasion, influence, compassion' },
      { number: 9, name: 'The Hermit', description: 'Soul searching, introspection, being alone, inner guidance' },
      { number: 10, name: 'Wheel of Fortune', description: 'Good luck, karma, life cycles, destiny, a turning point' },
      { number: 11, name: 'Justice', description: 'Justice, fairness, truth, cause and effect, law' },
      { number: 12, name: 'The Hanged Man', description: 'Pause, surrender, letting go, new perspectives' },
      { number: 13, name: 'Death', description: 'Endings, change, transformation, transition' },
      { number: 14, name: 'Temperance', description: 'Balance, moderation, patience, purpose' },
      { number: 15, name: 'The Devil', description: 'Shadow self, attachment, addiction, restriction, sexuality' },
      { number: 16, name: 'The Tower', description: 'Sudden change, upheaval, chaos, revelation, awakening' },
      { number: 17, name: 'The Star', description: 'Hope, faith, purpose, renewal, spirituality' },
      { number: 18, name: 'The Moon', description: 'Illusion, fear, anxiety, subconscious, intuition' },
      { number: 19, name: 'The Sun', description: 'Positivity, fun, warmth, success, vitality' },
      { number: 20, name: 'Judgement', description: 'Judgement, reflection, evaluation, awakening, rebirth' },
      { number: 21, name: 'The World', description: 'Completion, accomplishment, travel, achievement, fulfillment' }
    ];

    // Minor Arcana Suits
    const suits = ['Cups', 'Wands', 'Swords', 'Pentacles'];
    
    // Minor Arcana cards (Ace through King for each suit)
    const minorArcanaRanks = [
      { number: 1, name: 'Ace' },
      { number: 2, name: 'Two' },
      { number: 3, name: 'Three' },
      { number: 4, name: 'Four' },
      { number: 5, name: 'Five' },
      { number: 6, name: 'Six' },
      { number: 7, name: 'Seven' },
      { number: 8, name: 'Eight' },
      { number: 9, name: 'Nine' },
      { number: 10, name: 'Ten' },
      { number: 11, name: 'Page' },
      { number: 12, name: 'Knight' },
      { number: 13, name: 'Queen' },
      { number: 14, name: 'King' }
    ];

    // Insert Major Arcana
    console.log('Inserting Major Arcana cards...');
    for (const card of majorArcana) {
      await client.query(
        `INSERT INTO Cards (cards_suite, cards_number, cards_name, cards_description)
         VALUES ($1, $2, $3, $4)`,
        ['Major Arcana', card.number, card.name, card.description]
      );
    }
    console.log(`Inserted ${majorArcana.length} Major Arcana cards`);

    // Insert Minor Arcana
    console.log('Inserting Minor Arcana cards...');
    let minorCount = 0;
    
    for (const suit of suits) {
      for (const rank of minorArcanaRanks) {
        const cardName = `${rank.name} of ${suit}`;
        let description = '';
        
        // Add basic descriptions for court cards
        if (rank.number === 11) {
          description = `Page of ${suit}: New beginnings, messages, learning, curiosity`;
        } else if (rank.number === 12) {
          description = `Knight of ${suit}: Action, adventure, impulsiveness, movement`;
        } else if (rank.number === 13) {
          description = `Queen of ${suit}: Maturity, emotional security, compassion, understanding`;
        } else if (rank.number === 14) {
          description = `King of ${suit}: Leadership, authority, control, mastery`;
        } else {
          // Numbered cards - basic description
          description = `${rank.name} of ${suit}`;
        }
        
        await client.query(
          `INSERT INTO Cards (cards_suite, cards_number, cards_name, cards_description)
           VALUES ($1, $2, $3, $4)`,
          [suit, rank.number, cardName, description]
        );
        minorCount++;
      }
    }
    console.log(`Inserted ${minorCount} Minor Arcana cards`);

    await client.query('COMMIT');
    console.log(`\nSuccessfully inserted all 78 tarot cards!`);
    console.log(`Total: ${majorArcana.length} Major Arcana + ${minorCount} Minor Arcana = ${majorArcana.length + minorCount} cards`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error inserting cards:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Run if executed directly
if (require.main === module) {
  insertCards()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { insertCards };

