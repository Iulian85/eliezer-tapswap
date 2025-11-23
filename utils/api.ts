
// Frontend Client for the Backend API
// Note: On Railway, the Node server serves the frontend, so relative path '/api' is correct.
const API_URL = '/api'; 

export const api = {
    initUser: async (telegramId: number | string, username: string, referralCode?: string) => {
        try {
            console.log(`Sending initUser request for ${username} (${telegramId})...`);
            const res = await fetch(`${API_URL}/user/init`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegramId, username, referralCode })
            });
            
            if (!res.ok) {
                const errText = await res.text();
                // This error will be caught by the App.tsx try/catch and shown in alert
                throw new Error(`Server Error (${res.status}): ${errText}`);
            }
            
            return await res.json();
        } catch (e: any) {
            console.error("API Error (Init):", e);
            throw e; // Re-throw to be handled by UI
        }
    },

    saveGame: async (telegramId: number, saveData: any) => {
        try {
            const payload = {
                telegramId,
                state: {
                    levelIndex: saveData.levelIndex >= 0 ? saveData.levelIndex + 1 : 1,
                    totalScore: saveData.stats.totalScore,
                    totalTimePlayed: saveData.stats.totalTimePlayed,
                    adsViewed: saveData.stats.adsViewed,
                    lastDailyCompleted: saveData.lastDailyCompleted,
                    tonPurchases: saveData.stats.tonPurchases
                },
                inventory: saveData.inventory
            };

            const res = await fetch(`${API_URL}/game/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                 console.error("Save failed:", await res.text());
            }
        } catch (e) {
            console.error("Save API Error:", e);
        }
    },

    recordPurchase: async (telegramId: number, item: string, cost: number) => {
        try {
            const res = await fetch(`${API_URL}/shop/purchase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegramId, item, cost })
            });
             if (!res.ok) {
                 console.error("Purchase failed:", await res.text());
            }
        } catch (e) {
            console.error("Purchase Record API Error:", e);
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
