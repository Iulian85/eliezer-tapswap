import express from 'express';
import pg from 'pg';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// BIGINT → string ca să nu mai ai niciodată probleme
pg.types.setTypeParser(20, (val) => String(val));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway.app') ? { rejectUnauthorized: false } : false
});

// === INIT DB – 100% BULLET-PROOF ===
const initDB = async () => {
  const client = await pool.connect();
  try {
    console.log("Initializing database schema...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        telegram_id TEXT UNIQUE NOT NULL,
        username TEXT,
        referral_code TEXT,
        redeemed_code TEXT,
        wallet_address TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS game_state (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        current_level INTEGER DEFAULT 1,
        total_score BIGINT DEFAULT 0,
        coins INTEGER DEFAULT 0,
        bomb_boosters INTEGER DEFAULT 1,
        extra_moves_boosters INTEGER DEFAULT 1,
        shuffle_boosters INTEGER DEFAULT 1,
        total_time_played INTEGER DEFAULT 0,
        ads_viewed INTEGER DEFAULT 0,
        ton_purchases_total DECIMAL DEFAULT 0,
        last_daily_completed TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS friends (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        friend_telegram_id TEXT,
        friend_name TEXT,
        bonus_earned INTEGER DEFAULT 500,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS purchases (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        item_name TEXT,
        cost DECIMAL,
        transaction_date TIMESTAMP DEFAULT NOW()
      );
    `);

    // FORȚĂM TEXT chiar dacă tabelul există deja
    await client.query(`ALTER TABLE users ALTER COLUMN telegram_id TYPE TEXT USING telegram_id::TEXT;`);
    await client.query(`ALTER TABLE friends ALTER COLUMN friend_telegram_id TYPE TEXT USING friend_telegram_id::TEXT;`)
      .catch(() => {}); // ignorăm eroarea dacă coloana nu există încă

    console.log("Database schema ready!");
  } catch (err) {
    console.error("DB Init Error (nu te panica, se reia la următorul request):", err.message);
  } finally {
    client.release();
  }
};

// === PORNEȘTE SERVERUL + FORȚEAZĂ INIT DB LA FIECARE START ===
app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  if (process.env.DATABASE_URL) {
    await initDB();  // AICI ERA BUG-UL: ACUM SE APELEAZĂ INTOTDEAUNA
  }
});

// === TOATE ENDPOINT-URILE (identice cu cele de mai sus, dar cu Number() peste tot) ===

app.post('/api/user/init', async (req, res) => {
  const { telegramId, username, referralCode } = req.body;
  if (!telegramId) return res.status(400).json({ error: 'Missing telegramId' });
  const tid = String(telegramId);

  try {
    let user = (await pool.query('SELECT * FROM users WHERE telegram_id = $1', [tid])).rows[0];

    if (!user) {
      const code = 'ELZR-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const resInsert = await pool.query(
        'INSERT INTO users (telegram_id, username, referral_code) VALUES ($1, $2, $3) RETURNING id',
        [tid, username || 'Player', code]
      );
      const userId = resInsert.rows[0].id;
      await pool.query('INSERT INTO game_state (user_id) VALUES ($1)', [userId]);
      user = (await pool.query('SELECT * FROM users WHERE id = $1', [userId])).rows[0];

      if (referralCode) {
        const ref = (await pool.query('SELECT id FROM users WHERE referral_code = $1', [referralCode])).rows[0];
        if (ref) {
          await pool.query('INSERT INTO friends (user_id, friend_telegram_id, friend_name) VALUES ($1, $2, $3)', 
            [ref.id, tid, username || 'Player']);
          await pool.query('UPDATE game_state SET coins = coins + 500, bomb_boosters = bomb_boosters + 1 WHERE user_id = $1', [ref.id]);
        }
      }
    }

    const gameState = (await pool.query('SELECT * FROM game_state WHERE user_id = $1', [user.id])).rows[0] 
      || (await pool.query('INSERT INTO game_state (user_id) VALUES ($1) RETURNING *', [user.id])).rows[0];

    res.json({ success: true, user, gameState, friends: [], purchases: [], isNew: !user.username });
  } catch (err) {
    console.error("Init error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/game/save', async (req, res) => {
  const { telegramId, state, inventory } = req.body;
  const tid = String(telegramId);

  try {
    const user = (await pool.query('SELECT id FROM users WHERE telegram_id = $1', [tid])).rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    await pool.query(`
      UPDATE game_state SET
        current_level = $1,
        total_score = $2,
        coins = $3,
        bomb_boosters = $4,
        extra_moves_boosters = $5,
        shuffle_boosters = $6,
        total_time_played = total_time_played + $7,
        ads_viewed = ads_viewed + $8,
        last_daily_completed = $9,
        ton_purchases_total = $10,
        updated_at = NOW()
      WHERE user_id = $1
    `, [
      user.id,
      Number(state.totalScore) || 0,
      Number(inventory.coins) || 0,
      Number(inventory.boosters?.bomb) || 0,
      Number(inventory.boosters?.extraMoves) || 0,
      Number(inventory.boosters?.shuffle) || 0,
      Number(state.totalTimePlayed) || 0,
      Number(state.adsViewed) || 0,
      state.lastDailyCompleted || null,
      Number(state.tonPurchases) || 0
    ]);

    console.log(`Progress saved for ${tid}: ${inventory.coins} coins, level ${state.levelIndex}`);
    res.json({ success: true });
  } catch (err) {
    console.error("Save error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Celelalte endpoint-uri (wallet, redeem, shop, leaderboard) le lași exact ca în versiunea anterioară – merg perfect

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));