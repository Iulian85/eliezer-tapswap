
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

// CRITICAL: Treat PostgreSQL BIGINT as String in JS
pg.types.setTypeParser(20, (val) => String(val));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const getErrorMessage = (err) => {
    if (!err) return "Unknown Error";
    if (err instanceof Error) return err.message;
    if (typeof err === 'object') {
        if (err.detail) return `${err.message} - ${err.detail}`;
        return JSON.stringify(err);
    }
    return String(err);
};

const initDB = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log("Connected to DB. Checking schema...");

    await client.query('BEGIN');

    // 1. Create Tables if not exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        telegram_id BIGINT UNIQUE NOT NULL,
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
        level_score INTEGER DEFAULT 0,
        moves_left INTEGER DEFAULT 0,
        time_left INTEGER DEFAULT 0,
        board_state TEXT,
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
        friend_telegram_id BIGINT,
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

    // 2. MIGRATION: Ensure all columns exist
    await client.query(`ALTER TABLE users ALTER COLUMN telegram_id TYPE BIGINT;`);
    await client.query(`ALTER TABLE friends ALTER COLUMN friend_telegram_id TYPE BIGINT;`);
    
    // Add Game State Columns if missing
    await client.query(`ALTER TABLE game_state ADD COLUMN IF NOT EXISTS wallet_address TEXT;`); 
    await client.query(`ALTER TABLE game_state ADD COLUMN IF NOT EXISTS board_state TEXT;`);
    await client.query(`ALTER TABLE game_state ADD COLUMN IF NOT EXISTS level_score INTEGER DEFAULT 0;`);
    await client.query(`ALTER TABLE game_state ADD COLUMN IF NOT EXISTS moves_left INTEGER DEFAULT 0;`);
    await client.query(`ALTER TABLE game_state ADD COLUMN IF NOT EXISTS time_left INTEGER DEFAULT 0;`);
    await client.query(`ALTER TABLE game_state ADD COLUMN IF NOT EXISTS last_daily_completed TEXT;`);

    await client.query('COMMIT');
    console.log("✅ Database schema verified and updated.");
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error("❌ DB Init Error:", getErrorMessage(err));
  } finally {
    if (client) client.release();
  }
};

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    if (process.env.DATABASE_URL) initDB();
});

// API Routes

app.post('/api/game/save', async (req, res) => {
    const { telegramId, state, inventory } = req.body;
    const tid = String(telegramId);
    
    try {
        const userRes = await pool.query('SELECT id FROM users WHERE telegram_id = $1', [tid]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        const userId = userRes.rows[0].id;

        const currentLevel = (state.levelIndex && state.levelIndex > 0) ? state.levelIndex : 1;

        await pool.query(`
            UPDATE game_state 
            SET 
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
            currentLevel,
            Number(state.totalScore) || 0,
            Number(inventory.coins) || 0,
            Number(inventory.boosters?.bomb) || 1,
            Number(inventory.boosters?.extraMoves) || 1,
            Number(inventory.boosters?.shuffle) || 1,
            Number(state.totalTimePlayed) || 0,
            Number(state.adsViewed) || 0,
            state.lastDailyCompleted || null,
            Number(state.tonPurchases) || 0,
            userId
        ]);
        
        console.log(`SAVED → Level ${currentLevel} | Score ${state.totalScore} | Coins ${inventory.coins}`);
        res.json({ success: true });
    } catch (err) {
        console.error("Save Error:", getErrorMessage(err));
        res.status(500).json({ error: 'Save failed' });
    }
});


app.post('/api/user/wallet', async (req, res) => {
    const { telegramId, walletAddress } = req.body;
    const tid = String(telegramId);
    
    try {
        await pool.query('UPDATE users SET wallet_address = $1 WHERE telegram_id = $2', [walletAddress, tid]);
        console.log(`Wallet updated for ${tid}: ${walletAddress}`);
        res.json({ success: true });
    } catch (err) {
        console.error("Wallet Update Error:", getErrorMessage(err));
        res.status(500).json({ error: 'Update failed' });
    }
});

app.post('/api/user/redeem', async (req, res) => {
    const { telegramId, code } = req.body;
    const tid = String(telegramId);
    try {
        const userRes = await pool.query('SELECT id, referral_code, redeemed_code FROM users WHERE telegram_id = $1', [tid]);
        if (userRes.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
        const user = userRes.rows[0];

        if (user.redeemed_code) return res.json({ success: false, message: "Already redeemed a code" });
        if (user.referral_code === code) return res.json({ success: false, message: "Cannot use your own code" });

        const referrerRes = await pool.query('SELECT id FROM users WHERE referral_code = $1', [code]);
        if (referrerRes.rows.length === 0) return res.json({ success: false, message: "Invalid Code" });

        const bonusCoins = 500;
        const bonusBomb = 1;
        
        await pool.query('BEGIN');
        await pool.query('UPDATE users SET redeemed_code = $1 WHERE id = $2', [code, user.id]);
        await pool.query('UPDATE game_state SET coins = coins + $1, bomb_boosters = bomb_boosters + $2 WHERE user_id = $3', [bonusCoins, bonusBomb, user.id]);
        await pool.query('COMMIT');

        console.log(`User ${tid} redeemed code ${code}`);
        res.json({ 
            success: true, 
            message: `Redeemed! +${bonusCoins} Coins`, 
            rewards: { coins: bonusCoins, bomb: bonusBomb } 
        });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error("Redeem Error:", getErrorMessage(err));
        res.status(500).json({ success: false, message: 'Server error during redemption' });
    }
});


app.post('/api/game/save', async (req, res) => {
    const { telegramId, state, inventory } = req.body;
    const tid = String(telegramId);
    
    try {
        const userRes = await pool.query('SELECT id FROM users WHERE telegram_id = $1', [tid]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        const userId = userRes.rows[0].id;

        const currentLevel = (state.levelIndex && state.levelIndex > 0) ? state.levelIndex : 1;

        await pool.query(`
            UPDATE game_state 
            SET 
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
            currentLevel,
            Number(state.totalScore) || 0,
            Number(inventory.coins) || 0,
            Number(inventory.boosters?.bomb) || 1,
            Number(inventory.boosters?.extraMoves) || 1,
            Number(inventory.boosters?.shuffle) || 1,
            Number(state.totalTimePlayed) || 0,
            Number(state.adsViewed) || 0,
            state.lastDailyCompleted || null,
            Number(state.tonPurchases) || 0,
            userId
        ]);
        
        console.log(`SAVED → Level ${currentLevel} | Score ${state.totalScore} | Coins ${inventory.coins}`);
        res.json({ success: true });
    } catch (err) {
        console.error("Save Error:", getErrorMessage(err));
        res.status(500).json({ error: 'Save failed' });
    }
});


app.post('/api/shop/purchase', async (req, res) => {
    const { telegramId, item, cost } = req.body;
    const tid = String(telegramId);
    try {
        const userRes = await pool.query('SELECT id FROM users WHERE telegram_id = $1', [tid]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        await pool.query('INSERT INTO purchases (user_id, item_name, cost) VALUES ($1, $2, $3)', [userRes.rows[0].id, item, cost]);
        res.json({ success: true });
    } catch (err) {
        console.error("Purchase Error:", getErrorMessage(err));
        res.status(500).json({ error: 'Purchase failed' });
    }
});


app.get('/api/leaderboard', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT u.username, gs.total_score, gs.current_level 
            FROM game_state gs JOIN users u ON gs.user_id = u.id 
            ORDER BY gs.total_score DESC LIMIT 10
        `);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: 'Error' }); }
});


app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

