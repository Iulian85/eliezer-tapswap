
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

// CRITICAL FIX: Treat PostgreSQL BIGINT (Type ID 20) as String in JavaScript.
// Telegram IDs are 64-bit integers. JavaScript Numbers default to 53-bit precision.
// Without this, large Telegram IDs will be corrupted or cause JSON serialization crashes.
pg.types.setTypeParser(20, (val) => String(val));

// Middleware
app.use(cors());
app.use(express.json());
// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Database Connection
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Helper to extract meaningful error message
const getErrorMessage = (err) => {
    if (!err) return "Unknown Error";
    if (err instanceof Error) return err.message;
    if (typeof err === 'object') {
        // Try to capture Postgres specific error fields
        if (err.detail) return `${err.message} - ${err.detail}`;
        return JSON.stringify(err);
    }
    return String(err);
};

// Initialize Database Schema
const initDB = async () => {
  let client;
  try {
    console.log("Attempting to connect to database...");
    client = await pool.connect();
    console.log("Connected to database. Verifying schema...");

    await client.query('BEGIN');

    // Create Users Table
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

    // Create Game State Table
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

    // Create Friends Table
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

    // Create Purchases Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS purchases (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        item_name TEXT,
        cost DECIMAL,
        transaction_date TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query('COMMIT');
    console.log("✅ Database schema verified/initialized successfully.");
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error("❌ CRITICAL: Error initializing database schema:", getErrorMessage(err));
  } finally {
    if (client) client.release();
  }
};

// Start Server & Init DB
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    if (process.env.DATABASE_URL) {
        initDB();
    } else {
        console.error("❌ DATABASE_URL environment variable is missing! Check Railway Variables.");
    }
});


// --- API ROUTES ---

// 1. Initialize User (Login/Start)
app.post('/api/user/init', async (req, res) => {
    console.log('Received /api/user/init request:', req.body);

    const { telegramId, username, referralCode } = req.body;
    
    // Ensure telegramId is present
    if (!telegramId) {
        console.error('Missing telegramId in request');
        return res.status(400).json({ error: 'Missing telegramId' });
    }

    // Convert to string to ensure safe handling, though PG handles it via the parser now.
    const tid = String(telegramId);

    try {
        // Check if user exists
        const userRes = await pool.query('SELECT * FROM users WHERE telegram_id = $1', [tid]);
        
        let userId;
        let isNew = false;

        if (userRes.rows.length === 0) {
            console.log(`Creating new user: ${username} (${tid})`);
            
            // Create new user
            const myRefCode = 'ELZR-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            
            try {
                const insertRes = await pool.query(
                    'INSERT INTO users (telegram_id, username, referral_code) VALUES ($1, $2, $3) RETURNING id',
                    [tid, username, myRefCode]
                );
                userId = insertRes.rows[0].id;
                isNew = true;
            } catch (insertErr) {
                console.error("INSERT USER FAILED:", getErrorMessage(insertErr));
                throw insertErr;
            }

            // Initialize Game State
            try {
                await pool.query(
                    'INSERT INTO game_state (user_id) VALUES ($1)',
                    [userId]
                );
                console.log(`Initialized game state for user ID ${userId}`);
            } catch (stateErr) {
                console.error("GAME STATE INIT FAILED:", getErrorMessage(stateErr));
                throw stateErr;
            }

            // Handle Referral
            if (referralCode) {
                 // Check if referral code exists
                 const referrerRes = await pool.query('SELECT id FROM users WHERE referral_code = $1', [referralCode]);
                 if (referrerRes.rows.length > 0) {
                     const referrerId = referrerRes.rows[0].id;
                     
                     // Don't refer yourself
                     if (referrerId !== userId) {
                         try {
                            await pool.query(
                                'INSERT INTO friends (user_id, friend_telegram_id, friend_name) VALUES ($1, $2, $3)',
                                [referrerId, tid, username]
                            );
                            
                            await pool.query(`
                               UPDATE game_state 
                               SET coins = coins + 500, bomb_boosters = bomb_boosters + 1
                               WHERE user_id = $1
                            `, [referrerId]);
                         } catch (refErr) {
                            console.error("Referral processing error (non-fatal):", getErrorMessage(refErr));
                         }
                     }
                 }
            }
        } else {
            console.log(`User found: ${username} (${tid})`);
            userId = userRes.rows[0].id;
        }

        // Fetch FULL data for the frontend
        // Use a fresh connection or query to ensure we get the latest
        const user = (await pool.query('SELECT * FROM users WHERE id = $1', [userId])).rows[0];
        
        let gameState = {};
        const stateRes = await pool.query('SELECT * FROM game_state WHERE user_id = $1', [userId]);
        if (stateRes.rows.length > 0) {
            gameState = stateRes.rows[0];
        } else {
            // Self-healing: if user exists but state missing
            await pool.query('INSERT INTO game_state (user_id) VALUES ($1)', [userId]);
            gameState = (await pool.query('SELECT * FROM game_state WHERE user_id = $1', [userId])).rows[0];
        }

        const friends = (await pool.query('SELECT * FROM friends WHERE user_id = $1', [userId])).rows;
        const purchases = (await pool.query('SELECT * FROM purchases WHERE user_id = $1 ORDER BY transaction_date DESC', [userId])).rows;

        res.json({ 
            success: true, 
            user, 
            gameState,
            friends,
            purchases,
            isNew 
        });
    } catch (err) {
        const errorMsg = getErrorMessage(err);
        console.error("DB Init Error (General):", errorMsg);
        res.status(500).json({ error: 'Database error', details: errorMsg });
    }
});

// 2. Save Game State
app.post('/api/game/save', async (req, res) => {
    const { telegramId, state, inventory } = req.body;
    const tid = String(telegramId);
    
    try {
        const userRes = await pool.query('SELECT id FROM users WHERE telegram_id = $1', [tid]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        
        const userId = userRes.rows[0].id;

        await pool.query(`
            UPDATE game_state 
            SET 
                current_level = $1,
                total_score = $2,
                coins = $3,
                bomb_boosters = $4,
                extra_moves_boosters = $5,
                shuffle_boosters = $6,
                total_time_played = $7,
                ads_viewed = $8,
                last_daily_completed = $9,
                ton_purchases_total = $10,
                updated_at = NOW()
            WHERE user_id = $11
        `, [
            state.levelIndex,
            state.totalScore,
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

        res.json({ success: true });
    } catch (err) {
        console.error("DB Save Error:", err);
        res.status(500).json({ error: 'Save failed', details: getErrorMessage(err) });
    }
});

// 3. Record Purchase
app.post('/api/shop/purchase', async (req, res) => {
    const { telegramId, item, cost } = req.body;
    const tid = String(telegramId);
    
    try {
        const userRes = await pool.query('SELECT id FROM users WHERE telegram_id = $1', [tid]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        const userId = userRes.rows[0].id;

        await pool.query(
            'INSERT INTO purchases (user_id, item_name, cost) VALUES ($1, $2, $3)',
            [userId, item, cost]
        );
        console.log(`Purchase recorded: User ${userId} bought ${item} for ${cost}`);

        res.json({ success: true });
    } catch (err) {
        console.error("Purchase Record Error:", err);
        res.status(500).json({ error: 'Failed to record purchase', details: getErrorMessage(err) });
    }
});

// 4. Get Leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT u.username, gs.total_score, gs.current_level 
            FROM game_state gs
            JOIN users u ON gs.user_id = u.id
            ORDER BY gs.total_score DESC
            LIMIT 10
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("Leaderboard Error:", err);
        res.status(500).json({ error: 'Leaderboard failed', details: getErrorMessage(err) });
    }
});

// Serve React App
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
