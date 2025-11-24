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

pg.types.setTypeParser(20, (val) => String(val));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway.app') ? { rejectUnauthorized: false } : false
});

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

    await client.query(`ALTER TABLE users ALTER COLUMN telegram_id TYPE TEXT USING telegram_id::TEXT;`).catch(() => {});
    await client.query(`ALTER TABLE friends ALTER COLUMN friend_telegram_id TYPE TEXT USING friend_telegram_id::TEXT;`).catch(() => {});

    console.log("Database schema ready!");
  } catch (err) {
    console.error("DB Init Error:", err.message);
  } finally {
    client.release();
  }
};

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  if (process.env.DATABASE_URL) await initDB();
});

// ==================== API ENDPOINTS ====================

app.post('/api/user/init', async (req, res) => {
  const { telegramId, username, referralCode } = req.body;
  if (!telegramId) return res.status(400).json({ error: 'Missing telegramId' });
  const tid = String(telegramId);

  try {
    let user = (await pool.query('SELECT * FROM users WHERE telegram_id = $1', [tid])).rows[0];

    if (!user) {
      const code = 'ELZR-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const insert = await pool.query(
        'INSERT INTO users (telegram_id, username, referral_code) VALUES ($1, $2, $3) RETURNING id',
        [tid, username || 'Player', code]
      );
      await pool.query('INSERT INTO game_state (user_id) VALUES ($1)', [insert.rows[0].id]);
      user = (await pool.query('SELECT * FROM users WHERE telegram_id = $1', [tid])).rows[0];
    }

    const gameState = (await pool.query('SELECT * FROM game_state WHERE user_id = $1', [user.id])).rows[0]
      || (await pool.query('INSERT INTO game_state (user_id) VALUES ($1) RETURNING *', [user.id])).rows[0];

    res.json({ success: true, user, gameState, friends: [], purchases: [], isNew: true });
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
      WHERE user_id = $11
    `, [
      Number(state.levelIndex) || 1,
      Number(state.totalScore) || 0,
      Number(inventory.coins) || 0,
      Number(inventory.boosters?.bomb) || 0,
      Number(inventory.boosters?.extraMoves) || 0,
      Number(inventory.boosters?.shuffle) || 0,
      Number(state.totalTimePlayed) || 0,
      Number(state.adsViewed) || 0,
      state.lastDailyCompleted || null,
      Number(state.tonPurchases) || 0,
      user.id
    ]);

    console.log(`SAVED → Level ${state.levelIndex} | Coins ${inventory.coins} | Score ${state.totalScore}`);
    res.json({ success: true });
  } catch (err) {
    console.error("Save error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user/wallet', async (req, res) => {
  const { telegramId, walletAddress } = req.body;
  const tid = String(telegramId);
  try {
    await pool.query('UPDATE users SET wallet_address = $1 WHERE telegram_id = $2', [walletAddress, tid]);
    console.log(`Wallet saved: ${walletAddress}`);
    res.json({ success: true });
  } catch (err) {
    console.error("Wallet error:", err.message);
    res.status(500).json({ error: 'Failed' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});