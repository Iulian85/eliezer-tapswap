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

// BIGINT → string (obligatoriu pentru Telegram ID-uri mari)
pg.types.setTypeParser(20, (val) => String(val));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway.app') ? { rejectUnauthorized: false } : false
});

// === SCHEMA + MIGRATION 100% SIGURĂ ===
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

    // Forțăm TEXT pe coloanele critice (chiar dacă există deja)
    await client.query(`ALTER TABLE users ALTER COLUMN telegram_id TYPE TEXT USING telegram_id::TEXT;`).catch(() => {});
    await client.query(`ALTER TABLE friends ALTER COLUMN friend_telegram_id TYPE TEXT USING friend_telegram_id::TEXT;`).catch(() => {});

    console.log("Database schema 100% ready!");
  } catch (err) {
    console.error("DB Init Error:", err.message);
  } finally {
    client.release();
  }
};

// Pornim serverul + inițializăm DB-ul la fiecare start
app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  if (process.env.DATABASE_URL) await initDB();
});

// ====================== API ENDPOINTS ======================

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
      const userId = insert.rows[0].id;
      await pool.query('INSERT INTO game_state (user_id) VALUES ($1)', [userId]);
      user = (await pool.query('SELECT * FROM users WHERE id = $1', [userId])).rows[0];

      if (referralCode) {
        const ref = (await pool.query('SELECT id FROM users WHERE referral_code = $1', [referralCode])).rows[0];
        if (ref && ref.id !== user.id) {
          await pool.query('INSERT INTO friends (user_id, friend_telegram_id, friend_name) VALUES ($1, $2, $3)', [ref.id, tid, username || 'Player']);
          await pool.query('UPDATE game_state SET coins = coins + 500, bomb_boosters = bomb_boosters + 1 WHERE user_id = $1', [ref.id]);
        }
      }
    }

    const gameState = (await pool.query('SELECT * FROM game_state WHERE user_id = $1', [user.id])).rows[0]
      || (await pool.query('INSERT INTO game_state (user_id) VALUES ($1) RETURNING *', [user.id])).rows[0];

    const friends = (await pool.query('SELECT * FROM friends WHERE user_id = $1', [user.id])).rows;
    const purchases = (await pool.query('SELECT * FROM purchases WHERE user_id = $1 ORDER BY transaction_date DESC', [user.id])).rows;

    res.json({ success: true, user, gameState, friends, purchases, isNew: !user.username });
  } catch (err) {
    console.error("Init error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// SALVARE PROGRES – ACUM SALVEAZĂ ȘI LEVEL-UL CORECT!
app.post('/api/game/save', async (req, res) => {
  const { telegramId, state, inventory } = req.body;
  const tid = String(telegramId);

  try {
    const userRes = await pool.query('SELECT id FROM users WHERE telegram_id = $1', [tid]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const userId = userRes.rows[0].id;

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
      Number(state.levelIndex) || 1,           // LEVEL-ul salvat corect
      Number(state.totalScore) || 0,
      Number(inventory.coins) || 0,
      Number(inventory.boosters?.bomb) || 0,
      Number(inventory.boosters?.extraMoves) || 0,
      Number(inventory.boosters?.shuffle) || 0,
      Number(state.totalTimePlayed) || 0,
      Number(state.adsViewed) || 0,
      state.lastDailyCompleted || null,
      Number(state.tonPurchases) || 0,
      userId
    ]);

    console.log(`PROGRESS SAVED → ${tid} | Level: ${state.levelIndex} | Coins: ${inventory.coins} | Score: ${state.totalScore}`);
    res.json({ success: true });
  } catch (err) {
    console.error("Save error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// WALLET – ACUM SE SALVEAZĂ 100%
app.post('/api/user/wallet', async (’erano (req, res) => {
  const { telegramId, walletAddress } = req.body;
  const tid = String(telegramId);

  try {
    await pool.query('UPDATE users SET wallet_address = $1 WHERE telegram_id = $2', [walletAddress, tid]);
    console.log(`Wallet saved: ${tid} → ${walletAddress}`);
    res.json({ success: true });
  } catch (err) {
    console.error("Wallet save error:", err.message);
    res.status(500).json({ error: 'Failed to save wallet' });
  }
});

// REDEEM CODE
app.post('/api/user/redeem', async (req, res) => {
  const { telegramId, code } = req.body;
  const tid = String(telegramId);

  try {
    const userRes = await pool.query('SELECT id, redeemed_code, referral_code FROM users WHERE telegram_id = $1', [tid]);
    if (userRes.rows.length === 0) return res.json({ success: false, message: 'User not found' });
    const user = userRes.rows[0];

    if (user.redeemed_code) return res.json({ success: false, message: 'Already redeemed' });
    if (user.referral_code === code) return res.json({ success: false, message: 'Cannot use own code' });

    const ref = await pool.query('SELECT id FROM users WHERE referral_code = $1', [code]);
    if (ref.rows.length === 0) return res.json({ success: false, message: 'Invalid code' });

    await pool.query('BEGIN');
    await pool.query('UPDATE users SET redeemed_code = $1 WHERE id = $2', [code, user.id]);
    await pool.query('UPDATE game_state SET coins = coins + 500, bomb_boosters = bomb_boosters + 1 WHERE user_id = $1', [user.id]);
    await pool.query('COMMIT');

    res.json({ success: true, rewards: { coins: 500, bomb: 1 } });
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/shop/purchase', async (req, res) => {
  const { telegramId, item, cost } = req.body;
  const tid = String(telegramId);
  try {
    const user = await pool.query('SELECT id FROM users WHERE telegram_id = $1', [tid]);
    if (user.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    await pool.query('INSERT INTO purchases (user_id, item_name, cost) VALUES ($1, $2, $3)', [user.rows[0].id, item, cost]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Purchase failed' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.username, gs.total_score, gs.current_level 
      FROM game_state gs JOIN users u ON gs.user_id = u.id 
      ORDER BY gs.total_score DESC LIMIT 20
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Leaderboard error' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});