
// Frontend Client for the Backend API
// This communicates with server.js

// In production (Railway), API is same domain. In dev, we might need proxy or full URL.
// Since we serve static files from server.js in prod, relative path '/api' works perfectly.
const API_URL = '/api'; 

export const api = {
    initUser: async (telegramId: number, username: string, referralCode?: string) => {
        try {
            const res = await fetch(`${API_URL}/user/init`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegramId, username, referralCode })
            });
            if (!res.ok) throw new Error('Network response was not ok');
            return await res.json();
        } catch (e) {
            console.error("API Error (Init):", e);
            return null;
        }
    },

    saveGame: async (telegramId: number, saveData: any) => {
        try {
            // We only send relevant cloud data to match the DB schema
            const payload = {
                telegramId,
                state: {
                    levelIndex: saveData.levelIndex >= 0 ? saveData.levelIndex + 1 : 1, // Store as 1-based index in DB
                    totalScore: saveData.stats.totalScore,
                    totalTimePlayed: saveData.stats.totalTimePlayed,
                    adsViewed: saveData.stats.adsViewed,
                    lastDailyCompleted: saveData.lastDailyCompleted
                },
                inventory: saveData.inventory
            };

            await fetch(`${API_URL}/game/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (e) {
            console.error("Save Error:", e);
        }
    },

    getLeaderboard: async () => {
        try {
            const res = await fetch(`${API_URL}/leaderboard`);
            if (!res.ok) return [];
            return await res.json();
        } catch (e) {
            return [];
        }
    }
};
