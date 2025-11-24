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

// Inițializare tabele
const initDB = async () => {
  const client = await pool.connect();
  try {
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
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
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

    await client.query(`ALTER TABLE users ALTER COLUMN telegram_id TYPE TEXT USING telegram_id::TEXT;`).catch(() => {});
    console.log("DB ready!");
  } catch (err) {
    console.error("DB init error:", err.message);
  } finally {
    client.release();
  }
};

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  if (process.env.DATABASE_URL) await initDB();
});

// INIT + LOAD LEVEL CORECT
app.post('/api/user/init', async (req, res) => {
  const { telegramId, username } = req.body;
  if (!telegramId) return res.status(400).json({ error: 'Missing telegramId' });
  const tid = String(telegramId);

  try {
    let user = (await pool.query('SELECT * FROM users WHERE telegram_id = $1', [tid])).rows[0];

    if (!user) {
      const code = 'ELZR-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      await pool.query(
        'INSERT INTO users (telegram_id, username, referral_code) VALUES ($1, $2, $3)',
        [tid, username || 'Player', code]
      );
      user = (await pool.query('SELECT * FROM users WHERE telegram_id = $1', [tid])).rows[0];
      await pool.query('INSERT INTO game_state (user_id, current_level) VALUES ($1, 1)', [user.id]);
    }

    const gameState = (await pool.query('SELECT * FROM game_state WHERE user_id = $1', [user.id])).rows[0];

    res.json({
      success: true,
      user,
      gameState: gameState || { current_level: 1, total_score: 0, coins: 0, bomb_boosters: 1, extra_moves_boosters: 1, shuffle_boosters: 1 },
      isNew: false
    });
  } catch (err) {
    console.error("Init error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// SALVARE 100% CORECTĂ – LEVEL-UL RĂMÂNE EXACT CE TRIMIȚI
app.post('/api/game/save', async (req, res) => {
  const { telegramId, state, inventory } = req.body;
  const tid = String(telegramId);

  try {
    const userRes = await pool.query('SELECT id FROM users WHERE telegram_id = $1', [tid]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const userId = userRes.rows[0].id;

    const level = Number(state.levelIndex) || 1;  // <- LEVEL-UL EXACT PE CARE ÎL AI ÎN JOC

    await pool.query(`
      INSERT INTO game_state (
        user_id, current_level, total_score, coins, bomb_boosters,
        extra_moves_boosters, shuffle_boosters, total_time_played,
        ads_viewed, ton_purchases_total, last_daily_completed
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (user_id) DO UPDATE SET
        current_level = EXCLUDED.current_level,
        total_score = EXCLUDED.total_score,
        coins = EXCLUDED.coins,
        bomb_boosters = EXCLUDED.bomb_boosters,
        extra_moves_boosters = EXCLUDED.extra_moves_boosters,
        shuffle_boosters = EXCLUDED.shuffle_boosters,
        total_time_played = game_state.total_time_played + EXCLUDED.total_time_played,
        ads_viewed = game_state.ads_viewed + EXCLUDED.ads_viewed,
        ton_purchases_total = EXCLUDED.ton_purchases_total,
        last_daily_completed = EXCLUDED.last_daily_completed,
        updated_at = NOW()
    `, [
      userId,
      level,
      Number(state.totalScore) || 0,
      Number(inventory.coins) || 0,
      Number(inventory.boosters?.bomb) || 1,
      Number(inventory.boosters?.extraMoves) || 1,
      Number(inventory.boosters?.shuffle) || 1,
      Number(state.totalTimePlayed) || 0,
      Number(state.adsViewed) || 0,
      Number(state.tonPurchases) || 0,
      state.lastDailyCompleted || null
    ]);

    console.log(`SAVED → Level: ${level} | Coins: ${inventory.coins} | Score: ${state.totalScore}`);
    res.json({ success: true });
  } catch (err) {
    console.error("Save error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// WALLET
app.post('/api/user/wallet', async (req, res) => {
  const { telegramId, walletAddress } = req.body;
  const tid = String(telegramId);
  try {
    await pool.query('UPDATE users SET wallet_address = $1 WHERE telegram_id = $2', [walletAddress, tid]);
    console.log(`Wallet saved: ${walletAddress}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});