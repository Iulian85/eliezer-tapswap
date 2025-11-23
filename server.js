
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

// Test DB Connection on Start
pool.connect((err, client, release) => {
    if (err) {
        console.error('CRITICAL: Error acquiring client', err.stack);
    } else {
        console.log('Database Connected Successfully');
        release();
    }
});

// --- API ROUTES ---

// 1. Initialize User (Login/Start)
app.post('/api/user/init', async (req, res) => {
    console.log('Received /api/user/init request:', req.body); // LOG REQUEST

    const { telegramId, username, referralCode } = req.body;
    
    if (!telegramId) {
        console.error('Missing telegramId in request');
        return res.status(400).json({ error: 'Missing telegramId' });
    }

    try {
        // Check if user exists
        const userRes = await pool.query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);
        
        let userId;
        let isNew = false;

        if (userRes.rows.length === 0) {
            console.log(`Creating new user: ${username} (${telegramId})`);
            
            // Create new user
            const myRefCode = 'ELZR-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            
            try {
                // IMPORTANT: Ensure these column names match your manual table creation exactly!
                const insertRes = await pool.query(
                    'INSERT INTO users (telegram_id, username, referral_code) VALUES ($1, $2, $3) RETURNING id',
                    [telegramId, username, myRefCode]
                );
                userId = insertRes.rows[0].id;
                isNew = true;
            } catch (insertErr) {
                console.error("INSERT FAILED:", insertErr.message, insertErr.detail);
                throw insertErr; // Re-throw to catch block below
            }

            // Initialize Game State
            try {
                await pool.query(
                    'INSERT INTO game_state (user_id) VALUES ($1)',
                    [userId]
                );
                console.log(`Initialized game state for user ID ${userId}`);
            } catch (stateErr) {
                console.error("GAME STATE INIT FAILED:", stateErr.message);
                throw stateErr;
            }

            // Handle Referral
            if (referralCode) {
                 const referrerRes = await pool.query('SELECT id FROM users WHERE referral_code = $1', [referralCode]);
                 if (referrerRes.rows.length > 0) {
                     const referrerId = referrerRes.rows[0].id;
                     // Add to friends table
                     await pool.query(
                         'INSERT INTO friends (user_id, friend_telegram_id, friend_name) VALUES ($1, $2, $3)',
                         [referrerId, telegramId, username]
                     );
                     
                     // Reward Referrer
                     await pool.query(`
                        UPDATE game_state 
                        SET coins = coins + 500, bomb_boosters = bomb_boosters + 1
                        WHERE user_id = $1
                     `, [referrerId]);
                     console.log(`Referral processed: User ${userId} referred by ${referrerId}`);
                 }
            }
        } else {
            console.log(`User found: ${username} (${telegramId})`);
            userId = userRes.rows[0].id;
        }

        // Fetch FULL data for the frontend
        const user = userRes.rows.length > 0 ? userRes.rows[0] : (await pool.query('SELECT * FROM users WHERE id = $1', [userId])).rows[0];
        const stateRes = await pool.query('SELECT * FROM game_state WHERE user_id = $1', [userId]);
        const friendsRes = await pool.query('SELECT * FROM friends WHERE user_id = $1', [userId]);
        const purchasesRes = await pool.query('SELECT * FROM purchases WHERE user_id = $1 ORDER BY transaction_date DESC', [userId]);

        res.json({ 
            success: true, 
            user, 
            gameState: stateRes.rows[0],
            friends: friendsRes.rows,
            purchases: purchasesRes.rows,
            isNew 
        });
    } catch (err) {
        console.error("DB Init Error (General):", err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

// 2. Save Game State
app.post('/api/game/save', async (req, res) => {
    const { telegramId, state, inventory } = req.body;
    
    try {
        const userRes = await pool.query('SELECT id FROM users WHERE telegram_id = $1', [telegramId]);
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
        res.status(500).json({ error: 'Save failed' });
    }
});

// 3. Record Purchase
app.post('/api/shop/purchase', async (req, res) => {
    const { telegramId, item, cost } = req.body;
    
    try {
        const userRes = await pool.query('SELECT id FROM users WHERE telegram_id = $1', [telegramId]);
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
        res.status(500).json({ error: 'Failed to record purchase' });
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
        console.error(err);
        res.status(500).json({ error: 'Leaderboard failed' });
    }
});

// Serve React App
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
