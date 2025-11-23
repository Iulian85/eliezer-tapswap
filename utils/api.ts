
// Frontend Client for the Backend API
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
            const payload = {
                telegramId,
                state: {
                    levelIndex: saveData.levelIndex >= 0 ? saveData.levelIndex + 1 : 1,
                    totalScore: saveData.stats.totalScore,
                    totalTimePlayed: saveData.stats.totalTimePlayed,
                    adsViewed: saveData.stats.adsViewed,
                    lastDailyCompleted: saveData.lastDailyCompleted,
                    tonPurchases: saveData.stats.tonPurchases // Send this for update
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

    recordPurchase: async (telegramId: number, item: string, cost: number) => {
        try {
            await fetch(`${API_URL}/shop/purchase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegramId, item, cost })
            });
        } catch (e) {
            console.error("Purchase Record Error:", e);
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
