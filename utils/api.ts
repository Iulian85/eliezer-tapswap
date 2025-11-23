
// Frontend Client for the Backend API
// This communicates with server.js

const API_URL = '/api'; // Relative path works because server serves frontend

export const api = {
    initUser: async (telegramId: number, username: string, referralCode?: string) => {
        try {
            const res = await fetch(`${API_URL}/user/init`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegramId, username, referralCode })
            });
            return await res.json();
        } catch (e) {
            console.error("API Error:", e);
            return null;
        }
    },

    saveGame: async (telegramId: number, saveData: any) => {
        try {
            // We only send relevant cloud data
            const payload = {
                telegramId,
                state: {
                    levelIndex: saveData.levelIndex,
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
            return await res.json();
        } catch (e) {
            return [];
        }
    }
};
