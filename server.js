
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

app.post('/api/user/init', async (req, res) => {
    const { telegramId, username, referralCode } = req.body;
    if (!telegramId) return res.status(400).json({ error: 'Missing telegramId' });
    const tid = String(telegramId);

    try {
        const userRes = await pool.query('SELECT * FROM users WHERE telegram_id = $1', [tid]);
        let userId;
        let isNew = false;

        if (userRes.rows.length === 0) {
            console.log(`Creating user: ${username} (${tid})`);
            const code = 'ELZR-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            const insertRes = await pool.query(
                'INSERT INTO users (telegram_id, username, referral_code) VALUES ($1, $2, $3) RETURNING id',
                [tid, username, code]
            );
            userId = insertRes.rows[0].id;
            isNew = true;

            await pool.query('INSERT INTO game_state (user_id) VALUES ($1)', [userId]);

            if (referralCode) {
                 const referrerRes = await pool.query('SELECT id FROM users WHERE referral_code = $1', [referralCode]);
                 if (referrerRes.rows.length > 0) {
                     const referrerId = referrerRes.rows[0].id;
                     if (referrerId !== userId) {
                        await pool.query('INSERT INTO friends (user_id, friend_telegram_id, friend_name) VALUES ($1, $2, $3)', [referrerId, tid, username]);
                        await pool.query('UPDATE game_state SET coins = coins + 500, bomb_boosters = bomb_boosters + 1 WHERE user_id = $1', [referrerId]);
                     }
                 }
            }
        } else {
            userId = userRes.rows[0].id;
        }

        const user = (await pool.query('SELECT * FROM users WHERE id = $1', [userId])).rows[0];
        let gameState = (await pool.query('SELECT * FROM game_state WHERE user_id = $1', [userId])).rows[0];
        if (!gameState) {
             await pool.query('INSERT INTO game_state (user_id) VALUES ($1)', [userId]);
             gameState = (await pool.query('SELECT * FROM game_state WHERE user_id = $1', [userId])).rows[0];
        }

        const friends = (await pool.query('SELECT * FROM friends WHERE user_id = $1', [userId])).rows;
        const purchases = (await pool.query('SELECT * FROM purchases WHERE user_id = $1 ORDER BY transaction_date DESC', [userId])).rows;

        res.json({ success: true, user, gameState, friends, purchases, isNew });
    } catch (err) {
        console.error("Init User Error:", getErrorMessage(err));
        res.status(500).json({ error: 'DB Error', details: getErrorMessage(err) });
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
    const { telegramId, state, inventory, board } = req.body;
    const tid = String(telegramId);
    
    try {
        const userRes = await pool.query('SELECT id FROM users WHERE telegram_id = $1', [tid]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        const userId = userRes.rows[0].id;

        const currentLevel = state.levelIndex || 1;
        const totalScore = state.totalScore || 0;
        const levelScore = state.score || 0; // Current level score
        const movesLeft = state.moves || 0;
        const timeLeft = state.timeLeft || 0;
        const boardJson = board ? JSON.stringify(board) : null;
        
        await pool.query(`
            UPDATE game_state 
            SET 
                current_level = $1,
                total_score = $2,
                level_score = $3,
                moves_left = $4,
                time_left = $5,
                board_state = $6,
                coins = $7,
                bomb_boosters = $8,
                extra_moves_boosters = $9,
                shuffle_boosters = $10,
                total_time_played = $11,
                ads_viewed = $12,
                last_daily_completed = $13,
                ton_purchases_total = $14,
                updated_at = NOW()
            WHERE user_id = $15
        `, [
            currentLevel,
            totalScore,
            levelScore,
            movesLeft,
            timeLeft,
            boardJson,
            inventory.coins,
            inventory.boosters.bomb,
            inventory.boosters.extraMoves,
            inventory.boosters.shuffle,
            state.totalTimePlayed,
            state.adsViewed,
            state.lastDailyCompleted,
            state.tonPurchases,
            userId
        ]);
        
        console.log(`Saved for ${tid}: Level ${currentLevel}, Board saved: ${!!boardJson}`);
        res.json({ success: true });
    } catch (err) {
        console.error("Save Game Error:", getErrorMessage(err));
        res.status(500).json({ error: 'Save failed', details: getErrorMessage(err) });
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
