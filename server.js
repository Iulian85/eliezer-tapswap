
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
app.use(express.static(path.join(__dirname, 'dist')));

// Database Connection
// Railway provides DATABASE_URL automatically
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Railway/Neon connections
  }
});

// --- API ROUTES ---

// 1. Initialize User (Login/Start)
app.post('/api/user/init', async (req, res) => {
    const { telegramId, username, referralCode } = req.body;
    
    try {
        // Check if user exists
        const userRes = await pool.query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);
        
        let userId;
        let isNew = false;

        if (userRes.rows.length === 0) {
            // Create new user
            // Generate a random referral code for them if not provided
            const myRefCode = 'ELZR-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            
            const insertRes = await pool.query(
                'INSERT INTO users (telegram_id, username, referral_code) VALUES ($1, $2, $3) RETURNING id',
                [telegramId, username, myRefCode]
            );
            userId = insertRes.rows[0].id;
            isNew = true;

            // Initialize Game State
            await pool.query(
                'INSERT INTO game_state (user_id) VALUES ($1)',
                [userId]
            );

            // Handle being referred by someone else
            if (referralCode) {
                 const referrerRes = await pool.query('SELECT id FROM users WHERE referral_code = $1', [referralCode]);
                 if (referrerRes.rows.length > 0) {
                     const referrerId = referrerRes.rows[0].id;
                     // Add to friends table
                     await pool.query(
                         'INSERT INTO friends (user_id, friend_telegram_id, friend_name) VALUES ($1, $2, $3)',
                         [referrerId, telegramId, username]
                     );
                     // Update referrer stats? (Optional logic handled in game save usually)
                 }
            }
        } else {
            userId = userRes.rows[0].id;
        }

        // Fetch full state
        const stateRes = await pool.query('SELECT * FROM game_state WHERE user_id = $1', [userId]);
        const user = userRes.rows.length > 0 ? userRes.rows[0] : null;

        res.json({ success: true, user, gameState: stateRes.rows[0], isNew });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
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
                updated_at = NOW()
            WHERE user_id = $10
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
            userId
        ]);

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Save failed' });
    }
});

// 3. Get Leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        // Top 10 by Score
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

// Handle React Routing (Serve index.html for all other routes)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
